import {combineReducers} from "@reduxjs/toolkit";
import {userSlice} from "./user.slice.js";
import postsReducer from './post.slice.js';

export const reducers = combineReducers({
    user: userSlice.reducer,
    posts: postsReducer
})