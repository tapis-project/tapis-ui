import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'date-fns';

export interface PodsState {
  // arctiveXxxId: string; // Active item ID, used to store state when moving in and out of specific items.
  // Tab bars, used to store state when moving in and out of specific tabs.
  podTab: string;
  podRootTab: string;
  podEditTab: string;
  podDetailTab: string;
  podLogTab: string;
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

  setDetailsDropdownOpen?: boolean;
  setLogsDropdownOpen?: boolean;

  // Store current pod creation data (persisted between editors)
  createPodData?: any;
  updatePodData?: any;
  // Store current template creation data
  createTemplateData?: any;
  // Store current template tag creation data
  createTemplateTagData?: any;
  createTemplateTagTemplateId?: string;
}

const initialState: PodsState = {
  activePage: 'podspage',
  podTab: 'details',
  podRootTab: 'dashboard',
  podEditTab: 'form',
  podDetailTab: 'derived',
  podLogTab: 'logs',
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
  setDetailsDropdownOpen: false,
  setLogsDropdownOpen: false,
  // Persisted pod creation data
  createPodData: undefined,
  // Persisted pod update data
  updatePodData: undefined,
  // Persisted template creation data
  createTemplateData: undefined,
  // Persisted template tag creation data
  createTemplateTagData: undefined,
  createTemplateTagTemplateId: undefined,
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

// Examples:
// import { updateState, useAppDispatch, useAppSelector } from '@redux';
// GET
// const { podTab, podRootTab } = useAppSelector((state) => state.pods);
// POST
// const dispatch = useAppDispatch();
// dispatch(updateState({"podTab": tabValue, "podRootTab": rootTabValue}));
