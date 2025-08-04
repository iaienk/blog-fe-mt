import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "../services/post.service";

// thunk per caricare i post via REST
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
    modifiedIds: [],   // <— array di id modificati in questa sessione
    status: "idle",    // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    postUpdated: (state, action) => {
      const updated = action.payload;
      // 1) sostituisco il post in items
      const idx = state.items.findIndex(p => p.id === updated.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...updated };
      }
      // 2) marcalo come modificato
      if (!state.modifiedIds.includes(updated.id)) {
        state.modifiedIds.push(updated.id);
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        let postsArray = [];
        const payload = action.payload;
        if (Array.isArray(payload)) {
          postsArray = payload;
        } else if (payload.docs && Array.isArray(payload.docs)) {
          postsArray = payload.docs;
        } else if (payload.data && Array.isArray(payload.data)) {
          postsArray = payload.data;
        } else if (payload.posts && Array.isArray(payload.posts)) {
          postsArray = payload.posts;
        }
        // mappatura base
        state.items = postsArray.map(p => ({
          ...p,
          image: p.image || p.imageUrl || ""
        }));
        // NOTA: non tocchiamo modifiedIds su fetchAll
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  }
});

export const { postUpdated } = postSlice.actions;
export const selectAllPosts   = state => state.posts.items;
export const selectModifiedIds = state => state.posts.modifiedIds;
export const selectPostsStatus = state => state.posts.status;
export const selectPostsError  = state => state.posts.error;

export default postSlice.reducer;