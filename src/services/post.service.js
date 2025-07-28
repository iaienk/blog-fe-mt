const BASE_URL = "https://todo-pp.longwavestudio.dev";

export const getPosts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }
    const { posts } = await res.json();
    // TORNIAMO SOLO I POST, senza tentare di popolare author
    return posts;
  } catch (error) {
    console.error("post.service.getPosts:", error);
    throw error;
  }
};