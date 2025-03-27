import Fastify from 'fastify';
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

fastify.register(dbConnector);
fastify.register(notesRoutes);

fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
