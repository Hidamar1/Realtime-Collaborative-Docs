import type { FastifyRequest } from 'fastify';

export interface CurrentUser {
  id: string;
  name: string;
}

export function getCurrentUser(request: FastifyRequest): CurrentUser {
  const userId = request.headers['x-user-id'];
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('Missing x-user-id header');
  }
  return { id: userId, name: userId };
}
