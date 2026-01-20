// config/api.js
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    'API_URL is missing. Set EXPO_PUBLIC_API_URL in your .env and restart Expo with: npx expo start -c'
  );
}

const buildUrl = (path) => {
  if (!API_URL) throw new Error('API_URL is missing');
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_URL}${path}`;
};

async function request(method, path, body) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
};

export default api;
