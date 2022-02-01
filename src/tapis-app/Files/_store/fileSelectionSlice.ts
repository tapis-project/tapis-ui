import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Files } from '@tapis/tapis-typescript';

export interface FileSelectionState {
  selected: Array<Files.FileInfo>;
}

const initialState: FileSelectionState = {
  selected: []
};

export const fileSelectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    select: (state, action: PayloadAction<{ files: Array<Files.FileInfo>, mode: 'single' | 'multi' }>) => {
      const { mode, files } = action.payload;
      if (mode === 'single' && files.length === 1) {
        state.selected = files;
      }
      if (mode === 'multi') {
        const selectedSet = new Set(state.selected.map((file) => file.path));
        const newSelection = [
          ...state.selected,
          ...files.filter((file) => !selectedSet.has(file.path)),
        ];
        state.selected = newSelection;
      }
    },
    unselect: (state, action: PayloadAction<Array<Files.FileInfo>>) => {
      const files = action.payload;
      const selectedSet = new Set(
        state.selected.map((selected) => selected.path)
      );
      files.forEach((file) => selectedSet.delete(file.path ?? ''));
      const newSelection = state.selected.filter((selected) =>
        selectedSet.has(selected.path)
      );
      state.selected = newSelection;
    },
    clear: (state) => {
      state.selected = [];
    }
  },
});

export const { select, unselect, clear } = fileSelectionSlice.actions;

export default fileSelectionSlice.reducer;
