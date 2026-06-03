const apiBase = 'http://127.0.0.1:3000';

export async function apiGet<T>(path: string, userId = 'user-a'): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { headers: { 'x-user-id': userId } });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown, userId = 'user-a'): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
