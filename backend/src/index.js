import Fastify from 'fastify';
import cors from '@fastify/cors';
import dbConnector from './db/postgres-connector.js';
import notesRoutes from './routes/notes.routes.js';
import migrate from './db/migration.service.js';

try {
  await migrate();
} catch (err) {
  console.error('Migrations failed with error; ', err);
  process.exit(1);
}

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

fastify.register(dbConnector);
fastify.register(notesRoutes);

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
