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
        state.items = action.payload;
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