import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Jobs } from '@tapis/tapis-typescript';

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
      state.job = {
        ...state.job,
        ...action.payload
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