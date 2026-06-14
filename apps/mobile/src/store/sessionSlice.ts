import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SettingsState = {
    isUnlocked: boolean;
    unlockedAt?: string;
    lastUnlockedAt?: string;
    lastLockReason?: string;
};

const initialState: SettingsState = {
    isUnlocked: false,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setUnlocked(state, action: PayloadAction<{ unlockedAt: string }>) {
            state.isUnlocked = true;
            state.unlockedAt = action.payload.unlockedAt;
            delete state.lastUnlockedAt;
            delete state.lastLockReason;
        },
        setLocked(state,
            action: PayloadAction<{
                lockedAt: string;
                reason: string;
            }>
        ) {
            state.isUnlocked = false;
            delete state.unlockedAt;
            state.lastUnlockedAt = action.payload.lockedAt;
            state.lastLockReason = action.payload.reason
        },
    },
});

export const { setUnlocked, setLocked } = sessionSlice.actions;
export default sessionSlice.reducer;
