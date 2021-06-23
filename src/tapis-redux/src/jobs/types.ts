import { TapisListResults } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { JobsListingAction } from './list/types';

export type JobsReducerState = {
  jobs: TapisListResults<Jobs.JobListDTO>
}

export type JobsAction = 
  | JobsListingAction;

export type JobsReducer = (state: JobsReducerState, action: JobsAction) => JobsReducerState;