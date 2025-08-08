// src/reducers/comment.slice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';

const EMPTY_COMMENTS = [];

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    byPost: {} 
  },
  reducers: {
    commentsLoaded: (state, action) => {
      const { postId, comments } = action.payload;
      state.byPost[postId] = comments;
    },
    commentAdded: (state, action) => {
      const c = action.payload;
      state.byPost[c.postId] = state.byPost[c.postId] || [];
      state.byPost[c.postId].push(c);
    },
    commentUpdated: (state, action) => {
      const u = action.payload;
      state.byPost[u.postId] = state.byPost[u.postId].map(c =>
        c._id === u._id ? u : c
      );
    },
    commentRemoved: (state, action) => {
      const { postId, commentId } = action.payload;
      state.byPost[postId] = state.byPost[postId].filter(c => c._id !== commentId);
    }
  }
});

export const {
  commentsLoaded,
  commentAdded,
  commentUpdated,
  commentRemoved
} = commentsSlice.actions;

export default commentsSlice.reducer;

const selectByPost = state => state.comments.byPost;

export const makeSelectCommentsByPost = () =>
  createSelector(
    [selectByPost, (_state, postId) => postId],
    (byPost, postId) => byPost[postId] || EMPTY_COMMENTS
  );

export const makeSelectCommentCountByPost = () =>
  createSelector(
    [selectByPost, (_state, postId) => postId],
    (byPost, postId) => byPost[postId]?.length || 0
  );
