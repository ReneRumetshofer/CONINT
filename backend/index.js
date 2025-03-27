import Fastify from 'fastify';
import dbConnector from './db/postgres-connector.js';
import notesRoutes from './routes/notes.routes.js';
import migrate from './db/migration.service.js';

await migrate();

const fastify = Fastify({
  logger: true,
});

fastify.register(dbConnector);
fastify.register(notesRoutes);

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
