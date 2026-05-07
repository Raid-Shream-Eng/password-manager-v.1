import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import sessionReducer from './sessionSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        settings: settingsReducer,
        session: sessionReducer,
        ui: uiReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;