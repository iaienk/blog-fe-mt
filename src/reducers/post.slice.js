import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "../services/post.service";

export const fetchPosts = createAsyncThunk(
  "posts/fetchAll",
  async (_, thunkAPI) => {
    try {
      const posts = await postService.getPosts();
      return posts;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "idle",   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Mappiamo esplicitamente ogni post per garantire la proprietà `image`
        state.items = action.payload.map((p) => ({
          // manteniamo tutte le altre proprietà
          ...p,
          // se il BE restituisce `image`, lo usiamo; altrimenti proviamo `imageUrl`;
          // in mancanza di entrambi, fallback a stringa vuota o placeholder
          image: p.image || p.imageUrl || "",
        }));
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const selectAllPosts    = (state) => state.posts.items;
export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsError  = (state) => state.posts.error;

export default postSlice.reducer;
