import { TapisListResults } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { JobsListingAction } from './list/types';
import { JobsSubmitState, JobsSubmitAction } from './submit/types';

export type JobsReducerState = {
  jobs: TapisListResults<Jobs.JobListDTO>,
  submission: JobsSubmitState
}

export type JobsAction = 
  | JobsListingAction
  | JobsSubmitAction;

export type JobsReducer = (state: JobsReducerState, action: JobsAction) => JobsReducerState;