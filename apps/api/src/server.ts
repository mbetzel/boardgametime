import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => {
  return { status: 'ok', service: 'boardgametime-api', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`API Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
