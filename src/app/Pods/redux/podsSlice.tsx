import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PodsState {
  podTab: string;
  volumeTab?: string;
  volumeRootTab?: string;

  lastPodId?: string;
  lastVolumeId?: string;
  lastSnapshotId?: string;
  lastTemplateId?: string;
  lastImageId?: string;
  currentPage?: string;
}

const initialState: PodsState = {
  currentPage: 'pods',
  podTab: 'details',
  volumeTab: 'details',
  volumeRootTab: 'dashboard',
};

const podsSlice = createSlice({
  name: 'pods',
  initialState,
  reducers: {
    setIds(state, action: PayloadAction<Partial<PodsState>>) {
      return { ...state, ...action.payload };
    },
    setPodTab(state, action: PayloadAction<string>) {
      const tabValue = action.payload;
      state.podTab = tabValue;
    },
    setVolumeTab(state, action: PayloadAction<string>) {
      const tabValue = action.payload;
      state.volumeTab = tabValue;
    },
    setVolumeRootTab(state, action: PayloadAction<string>) {
      const tabValue = action.payload;
      state.volumeRootTab = tabValue;
    },
  },
});

export const { setIds, setPodTab, setVolumeTab, setVolumeRootTab } =
  podsSlice.actions;
export default podsSlice.reducer;
