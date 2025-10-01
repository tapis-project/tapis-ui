import { Workflows } from '@tapis/tapis-typescript';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkflowsState {
  currentGroupId?: string;
  groups: Array<Workflows.Group>;
}

const initialState: WorkflowsState = {
  currentGroupId: undefined,
  groups: [],
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
