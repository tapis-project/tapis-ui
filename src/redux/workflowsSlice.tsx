import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkflowsState {
  activePipelineId?: string;
}

const initialState: WorkflowsState = {
  activePipelineId: undefined,
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    updateState(state, action: PayloadAction<Partial<WorkflowsState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateState } = workflowsSlice.actions;
export const reducer = workflowsSlice.reducer;
