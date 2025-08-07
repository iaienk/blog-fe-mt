// src/reducers/post.slice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import * as postService from "../services/post.service";

// Carica da localStorage gli ID già eliminati in sessioni precedenti
const persistedDeletedIds = (() => {
  try {
    const raw = window.localStorage.getItem("deletedPosts");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
})();

// Thunk per caricare i post via REST
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

const initialState = {
  items: [],            // tutti i post
  modifiedIds: [],      // id modificati in questa sessione
  deletedIds: persistedDeletedIds,  // id cancellati, persiste tra refresh
  status: "idle",       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    postUpdated(state, action) {
      const updated = action.payload;
      const idx = state.items.findIndex(p => p.id === updated.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...updated };
      }
      if (!state.modifiedIds.includes(updated.id)) {
        state.modifiedIds.push(updated.id);
      }
    },
    postDeleted(state, action) {
      const deletedId = action.payload;
      if (!state.deletedIds.includes(deletedId)) {
        state.deletedIds.push(deletedId);
        try {
          window.localStorage.setItem(
            "deletedPosts",
            JSON.stringify(state.deletedIds)
          );
        } catch (err) {
          console.warn("Could not persist deletedPosts to localStorage", err);
        }
      }
      state.modifiedIds = state.modifiedIds.filter(id => id !== deletedId);
      const idx = state.items.findIndex(p => p.id === deletedId);
      if (idx !== -1) {
        state.items[idx].status = "deleted";
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.status = "loading";
        state.error  = null;
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
        state.items = postsArray.map(p => {
          const id = p._id || p.id;
          return {
            id,
            title:       p.title,
            content:     p.content,
            authorId:    p.authorId,
            publishDate: p.publishDate,
            image:       p.image || p.imageUrl || "",
            tags:        Array.isArray(p.tags) ? p.tags : [],
            status:      state.deletedIds.includes(id) ? "deleted" : "",
            // nuovi campi per like
            total_likes: typeof p.total_likes === "number"
                         ? p.total_likes
                         : typeof p.likesCount === "number"
                           ? p.likesCount
                           : 0,
            liked_by:    Array.isArray(p.liked_by)
                              ? p.liked_by
                              : Array.isArray(p.likedBy)
                                ? p.likedBy
                                : Array.isArray(p.userIds)
                                  ? p.userIds
                                  : []
          };
        });
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload ?? action.error.message;
      });
  }
});

export const { postUpdated, postDeleted } = postSlice.actions;

// Base selector sullo slice
const selectPostsState = state => state.posts;

// Memoized selectors
export const selectAllPosts = createSelector(
  [selectPostsState],
  postsState => postsState.items
);

export const selectDeletedIds = createSelector(
  [selectPostsState],
  postsState => postsState.deletedIds
);

// Questi possono restare semplici
export const selectModifiedIds = state => state.posts.modifiedIds;
export const selectPostsStatus = state => state.posts.status;
export const selectPostsError  = state => state.posts.error;

export default postSlice.reducer;