import Fastify from 'fastify';
import routes from '../../routes/notes.routes.js';
import { encryptNote } from '../../services/crypto.service.js';
import { v4 as uuidv4 } from 'uuid';
import supertest from 'supertest';

describe('Notes routes IT', () => {
  let fastify;

  beforeEach(async () => {
    fastify = Fastify();

    // Mock Posgres with in-memory
    const mockNotes = new Map();

    fastify.decorate('pg', {
      query: jest.fn((sql, params, cb) => {
        if (typeof params === 'function') {
          cb = params;
        }

        if (sql.startsWith('SELECT notes_uuid, title FROM notes')) {
          cb(null, {
            rows: [...mockNotes.values()].map(({ title, uuid }) => ({
              notes_uuid: uuid,
              title,
            })),
          });
        } else if (sql.startsWith('SELECT content FROM notes')) {
          const uuid = params[0];
          const note = mockNotes.get(uuid);
          if (!note) {
            cb(null, { rows: [] });
          } else {
            cb(null, { rows: [{ content: note.encrypted }] });
          }
        } else {
          cb(new Error('Unknown query'));
        }
      }),

      transact: async (callback) => {
        const client = {
          query: async (sql, params) => {
            if (sql.startsWith('INSERT INTO notes')) {
              const [uuid, title, encrypted] = params;
              mockNotes.set(uuid, { uuid, title, encrypted });
            } else if (sql.startsWith('DELETE FROM notes')) {
              mockNotes.delete(params[0]);
            }
          },
        };
        await callback(client);
      },
    });

    await fastify.register(routes);
    await fastify.ready();
  });

  afterEach(() => {
    fastify.close();
  });

  // --- 1. GET /notes
  it('should return all notes (GET /notes)', async () => {
    const noteId = uuidv4();
    const title = 'Test Note';
    const encrypted = encryptNote('test-key', 'Secret message');

    fastify.pg.transact(async (client) => {
      await client.query(
        'INSERT INTO notes(notes_uuid, title, content) VALUES($1, $2, $3)',
        [noteId, title, encrypted]
      );
    });

    const res = await supertest(fastify.server).get('/api/notes');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ notes_uuid: noteId, title }]);
  });

  // --- 2. POST /notes and GET /notes/:uuid
  it('should encrypt, store, and retrieve a note with correct decryption (POST & GET)', async () => {
    const note = {
      title: 'Encrypted Note',
      content: 'Top secret content!',
      key: 'my-passphrase',
    };

    const postRes = await supertest(fastify.server)
      .post('/api/notes')
      .send(note);
    expect(postRes.statusCode).toBe(200);

    const listRes = await supertest(fastify.server).get('/api/notes');
    const noteUUID = listRes.body[0]?.notes_uuid;
    expect(noteUUID).toBeDefined();

    const getRes = await supertest(fastify.server).get(
      `/api/notes/${noteUUID}?key=${note.key}`
    );

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe(note.content);
  });

  // --- 3. GET /notes/:uuid with wrong key
  it('should return 403 for wrong decryption key', async () => {
    const encrypted = encryptNote('correct-key', 'Private');

    const uuid = uuidv4();
    await fastify.pg.transact(async (client) => {
      await client.query(
        'INSERT INTO notes(notes_uuid, title, content) VALUES($1, $2, $3)',
        [uuid, 'Wrong Key Test', encrypted]
      );
    });

    const res = await supertest(fastify.server).get(
      `/api/notes/${uuid}?key=wrong-key`
    );

    expect(res.statusCode).toBe(403);
    expect(res.text).toBe('Key is invalid');
  });
});
