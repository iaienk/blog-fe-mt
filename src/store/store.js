import storage from "redux-persist/lib/storage";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from "redux-persist";
import {configureStore} from "@reduxjs/toolkit";
import {reducers} from "../reducers/reducers.js";

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['posts'],
}

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        });
    },
});

export const persistor = persistStore(store);