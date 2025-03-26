import Fastify from "fastify";
import dbConnector from "./infra/postgres-connector.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(dbConnector);

// Declare a route
fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
