import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Jobs } from '@tapis/tapis-typescript';
import { parse } from 'path';

export interface JobState {
  job: Partial<Jobs.ReqSubmitJob>
}

const initialState: JobState = {
  job: {}
}

export const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Partial<Jobs.ReqSubmitJob>>) => {
      // Object deep copying is required due to array mutation restriction in RTK
      state.job = {
        ...JSON.parse(JSON.stringify(state.job)),
        ...JSON.parse(JSON.stringify(action.payload))
      }
    },
    set: (state, action: PayloadAction<Partial<Jobs.ReqSubmitJob>>) => {
      state.job = action.payload
    },
    clear: (state) => {
      state.job = {}
    }
  }
})

export const { add, set, clear } = jobSlice.actions;

export default jobSlice.reducer;