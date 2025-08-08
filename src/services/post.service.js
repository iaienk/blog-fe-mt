const BASE_URL = import.meta.env.VITE_API_URL;

export async function getPosts({ limit } = {}) {
  let url = `${BASE_URL}/posts`;
  const params = new URLSearchParams();
  if (limit !== undefined) params.set('limit', limit);
  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch posts failed (${res.status}): ${text}`);
  }
  return res.json();
}