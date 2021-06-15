import { list } from './list/reducer';
import { getEmptyListResults } from 'tapis-redux/types/results';
import { AppsReducerState, AppsAction, AppsReducer } from './types';
import { TAPIS_DEFAULT_APPS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';

const emptyResults = getEmptyListResults(TAPIS_DEFAULT_APPS_LISTING_LIMIT);

export const initialState: AppsReducerState = {
  apps: { ...emptyResults }
};

export function apps(state: AppsReducerState=initialState, action: AppsAction): AppsReducerState {
  // Apply each of the sub-reducers in sequence
  const reducers: Array<AppsReducer> = [ list ];
  let result = { ...state };
  reducers.forEach(
    (reducer) => {
      result = reducer(result, action)
    }
  );
  return result;
}