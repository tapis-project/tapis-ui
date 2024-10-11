import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'date-fns';

export interface PodsState {
  // arctiveXxxId: string; // Active item ID, used to store state when moving in and out of specific items.
  // Tab bars, used to store state when moving in and out of specific tabs.
  podTab: string;
  podRootTab: string;
  activePodId?: string;

  imageTab?: string;
  imageRootTab?: string;
  activeImageId?: string;

  volumeTab?: string;
  volumeRootTab?: string;
  activeVolumeId?: string;

  snapshotTab?: string;
  snapshotRootTab?: string;
  activeSnapshotId?: string;

  templateTab: string;
  templateTagTab: string;
  templateRootTab: string;
  activeTemplate?: string;
  activeTemplateTag?: string;
  templateNavSelectedItems: string; //multiselect in treeview must be on for string[]
  templateNavExpandedItems: string[];

  activePage?: string;
}

const initialState: PodsState = {
  activePage: 'pods',
  podTab: 'details',
  podRootTab: 'dashboard',
  imageTab: 'details',
  imageRootTab: 'dashboard',
  volumeTab: 'details',
  volumeRootTab: 'dashboard',
  snapshotTab: 'details',
  snapshotRootTab: 'dashboard',
  templateTab: 'details',
  templateTagTab: 'details',
  templateRootTab: 'dashboard',
  templateNavExpandedItems: [],
  templateNavSelectedItems: '',
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

// GET
// const { podTab, podRootTab } = useAppSelector((state) => state.pods);

// POST
// dispatch(updateState({"podTab": tabValue, "podRootTab": rootTabValue}));
