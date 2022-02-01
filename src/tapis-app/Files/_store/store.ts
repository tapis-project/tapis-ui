
import { combineReducers } from "@reduxjs/toolkit";
import { default as fileSelectionReducer } from './fileSelectionSlice';

const filesReducer = combineReducers({
  selection: fileSelectionReducer
});

export default filesReducer;