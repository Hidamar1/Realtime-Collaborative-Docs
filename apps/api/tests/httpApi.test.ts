import { afterEach, describe, expect, test } from 'vitest';
import { buildServer } from '../src/server';

const servers: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(servers.map((server) => server.close()));
  servers.length = 0;
});

describe('HTTP API', () => {
  test('creates a document from template and exposes public preview only after sharing is enabled', async () => {
    const server = buildServer();
    servers.push(server);

    const templatesResponse = await server.inject({ method: 'GET', url: '/api/templates', headers: { 'x-user-id': 'user-a' } });
    const templates = templatesResponse.json();

    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/documents/from-template',
      headers: { 'x-user-id': 'user-a' },
      payload: { templateId: templates[0].id }
    });
    const document = createResponse.json();

    const shareResponse = await server.inject({
      method: 'POST',
      url: `/api/documents/${document.id}/share`,
      headers: { 'x-user-id': 'user-a' }
    });
    const share = shareResponse.json();

    const previewResponse = await server.inject({ method: 'GET', url: `/api/public/${share.token}` });
    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json().document.id).toBe(document.id);
    expect(previewResponse.json().comments).toBeUndefined();
  });
});
