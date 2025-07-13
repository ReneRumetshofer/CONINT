import {
  encryptNote,
  generateUUID,
  decryptNote,
} from '../services/crypto.service.js';

async function routes(fastify, options) {
  fastify.get('/api/notes', async (request, reply) => {
    fastify.pg.query(
      'SELECT notes_uuid, title FROM notes',
      function onResult(err, result) {
        reply.send(err || result?.rows);
      }
    );

    return reply;
  });

  const getNoteOpts = {
    schema: {
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          key: { type: 'string' },
        },
      },
      query: {
        type: 'object',
        required: ['key'],
        properties: {
          key: { type: 'string' },
        },
      },
    },
  };
  fastify.get('/api/notes/:uuid', getNoteOpts, async (request, reply) => {
    console.log(request.query);
    fastify.pg.query(
      'SELECT content FROM notes WHERE notes_uuid = $1',
      [request.params.uuid],
      function onResult(err, result) {
        if (err) {
          reply.code(500).send('Error while fetching note');
          return;
        }
        if (result.rows.length === 0) {
          reply.code(404).send('Note not found');
          return;
        }

        try {
          reply.send(decryptNote(request.query.key, result.rows[0].content));
        } catch (err) {
          reply.code(403).send('Key is invalid');
        }
      }
    );

    return reply;
  });

  const postNoteOpts = {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'content', 'key'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          key: { type: 'string' },
        },
      },
    },
  };
  fastify.post('/api/notes', postNoteOpts, async (request, reply) => {
    const encryptedContent = encryptNote(
      request.body.key,
      request.body.content
    );
    const noteUuid = generateUUID();
    return fastify.pg.transact(async (client) => {
      await client.query(
        'INSERT INTO notes(notes_uuid, title, content) VALUES($1, $2, $3)',
        [noteUuid, request.body.title, encryptedContent]
      );
      reply.code(200).send({ notes_uuid: noteUuid });
    });
  });

  const deleteNotesOpts = {
    schema: {
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { type: 'string' },
        },
      },
    },
  };
  fastify.delete('/api/notes/:uuid', async (request, reply) => {
    return fastify.pg.transact(async (client) => {
      await client.query('DELETE FROM notes WHERE notes_uuid = $1', [
        request.params.uuid,
      ]);
      reply.code(200);
    });
  });
}

export default routes;
