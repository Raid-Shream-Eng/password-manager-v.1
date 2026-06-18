import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type LockTimeoutSeconds = 30|60|120|300|600|900
export type ThemeMode = "system" | "light" | "dark";
export type AppLanguage = "system" | "en" | "ar";

type SettingsState = {
    lockTimeoutSeconds: LockTimeoutSeconds;
    themeMode: ThemeMode;
    language: AppLanguage;
};

const initialState: SettingsState = {
    lockTimeoutSeconds: 120 ,
    themeMode: "system",
    language: "system",
};


const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setLockTimeoutSeconds(
            state,
            action: PayloadAction<LockTimeoutSeconds>
        ){
            state.lockTimeoutSeconds = action.payload;
        },
        setThemeMode(state, action: PayloadAction<SettingsState['themeMode']>) {
            state.themeMode = action.payload;
        },
        setLanguage(state, action: PayloadAction<SettingsState["language"]>) {
            state.language = action.payload;
        },
    },
});

export const { setLockTimeoutSeconds, setThemeMode, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
