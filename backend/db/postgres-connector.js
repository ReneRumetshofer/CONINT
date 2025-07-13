import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';

/**
 * @param {FastifyInstance} fastify
 */
async function dbConnector(fastify) {
  const env = process.env;
  const connectionString = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
  fastify.register(fastifyPostgres, {
    connectionString: connectionString,
  });
}

export default fastifyPlugin(dbConnector);
