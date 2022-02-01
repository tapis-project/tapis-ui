import { combineReducers } from '@reduxjs/toolkit';
import { jobBuilderReducer } from './jobBuilder';

const jobs = combineReducers({
  builder: jobBuilderReducer,
});

export default jobs;
