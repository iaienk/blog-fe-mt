import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "../services/post.service";

// Ora fetchPosts può ricevere parametri { page, limit }
export const fetchPosts = createAsyncThunk(
  "posts/fetchAll",
  async (params, thunkAPI) => {
    try {
      const result = await postService.getPosts(params);
      return result;
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
        // action.payload potrebbe essere un array o un oggetto paginato
        let postsArray = [];
        if (Array.isArray(action.payload)) {
          postsArray = action.payload;
        } else if (action.payload.docs && Array.isArray(action.payload.docs)) {
          postsArray = action.payload.docs;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          postsArray = action.payload.data;
        } else if (action.payload.posts && Array.isArray(action.payload.posts)) {
          postsArray = action.payload.posts;
        }
        // mappatura per garantire sempre il campo image
        state.items = postsArray.map(p => ({
          ...p,
          image: p.image || p.imageUrl || ""
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