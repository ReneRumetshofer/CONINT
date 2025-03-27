async function routes(fastify, options) {
  fastify.get('/notes', async (request, reply) => {
    fastify.pg.query(
      'SELECT notes_uuid, hmac, content FROM notes',
      function onResult(err, result) {
        reply.send(err || result?.rows);
      }
    );

    return reply;
  });
}

export default routes;
