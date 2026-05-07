import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SettingsState = {
    isUnlocked: boolean;
    lastUnlockedAt: number | null;
};

const initialState: SettingsState = {
    isUnlocked: false,
    lastUnlockedAt: null,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setUnlocked(state, action: PayloadAction<{ isUnlocked: boolean; lastUnlockedAt: number | null }>) {
            state.isUnlocked = action.payload.isUnlocked;
            state.lastUnlockedAt = action.payload.lastUnlockedAt;
        },
        lockSession(state) {
            state.isUnlocked = false;
            state.lastUnlockedAt = null;
        },
    },
});

export const { setUnlocked, lockSession } = sessionSlice.actions;
export default sessionSlice.reducer;