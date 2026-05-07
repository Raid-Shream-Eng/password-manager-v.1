import {createSlice , type PayloadAction } from '@reduxjs/toolkit';

type UiState = {
    selectedItemId: string | null;
};

const initialState: UiState = {
    selectedItemId: null,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setSelectedItemId(state, action: PayloadAction<string | null>) {
            state.selectedItemId = action.payload;
        },
    },
});

export const { setSelectedItemId } = uiSlice.actions;
export default uiSlice.reducer;
