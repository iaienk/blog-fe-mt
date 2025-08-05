import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
        // salva subito la lista aggiornata in localStorage
      try {
        window.localStorage.setItem(
          "deletedPosts",
          JSON.stringify(state.deletedIds)
        );
      } catch (err) {
        console.warn("Could not persist deletedPosts to localStorage", err);
      }
      }
      // rimuovo da modifiedIds se presente
      state.modifiedIds = state.modifiedIds.filter(id => id !== deletedId);
      // marca anche lo status nell’array items (se già caricato)
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
        // 1) estraggo l'array reale dei post dal payload
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
        // 2) mappa _id → id, include tutti i campi di interesse
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
            // 3) se era in deletedIds, marca status
            status: state.deletedIds.includes(id) ? "deleted" : "",
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

// Selectors
export const selectAllPosts    = state => state.posts.items;
export const selectModifiedIds = state => state.posts.modifiedIds;
export const selectDeletedIds  = state => state.posts.deletedIds;
export const selectPostsStatus = state => state.posts.status;
export const selectPostsError  = state => state.posts.error;

export default postSlice.reducer;