import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'date-fns';

interface PodsState {
  // Tab bars, used to store state when moving in and out of specific tabs.
  podTab: string;
  volumeTab?: string;
  volumeRootTab?: string;
  templateTab: string;
  templateTagTab: string;

  // Current IDs for the selected obj. Used for lots.
  activeTemplate?: string;
  activeTemplateTag?: string;
  templateNavSelectedItems: string; //multiselect must be on for string[]
  templateNavExpandedItems: string[];

  lastPodId?: string;
  lastVolumeId?: string;
  lastSnapshotId?: string;
  lastImageId?: string;
  currentPage?: string;
}

const initialState: PodsState = {
  currentPage: 'pods',
  podTab: 'details',
  volumeTab: 'details',
  volumeRootTab: 'dashboard',
  templateNavExpandedItems: [],
  templateNavSelectedItems: '',
  templateTab: 'details',
  templateTagTab: 'details',
};

const podsSlice = createSlice({
  name: 'pods',
  initialState,
  reducers: {
    // Use with:
    // dispatch(updateState({"podTab": tabValue}));
    updateState(state, action: PayloadAction<Partial<PodsState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateState } = podsSlice.actions;
export default podsSlice.reducer;
