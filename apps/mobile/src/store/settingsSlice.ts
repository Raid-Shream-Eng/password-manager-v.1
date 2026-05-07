import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SettingsState = {
    theme: "system" | "light" | "dark";
    language: string;
};

const initialState: SettingsState = {
    theme: "system",
    language: "en",
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<SettingsState['theme']>) {
            state.theme = action.payload;
        },
        setLanguage(state, action: PayloadAction<string>) {
            state.language = action.payload;
        },
    },
});

export const { setTheme, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
