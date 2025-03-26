async function routes (fastify, options) {
    const collection = fastify.mongo.db.collection('test_collection')

    fastify.get('/', async (request, reply) => {
        return {hello: 'world'}
    })
}

export default routes;