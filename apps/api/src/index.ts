import { buildServer } from './server';

const server = buildServer();
await server.listen({ host: '127.0.0.1', port: 3000 });
console.log('API listening on http://127.0.0.1:3000');
