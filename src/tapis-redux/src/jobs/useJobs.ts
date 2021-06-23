import { useSelector } from 'react-redux';
import { list } from './list/actions';
import { submit } from './submit/actions';
import { TapisState } from '../store/rootReducer';
import { JobsListCallback } from './list/types';
import { JobsSubmitCallback } from './submit/types';
import { Jobs } from '@tapis/tapis-typescript';

export interface ListJobsParams {
  onList?: JobsListCallback
}

export interface SubmitJobsParams {
  onSubmit?: JobsSubmitCallback
  request: Jobs.ReqSubmitJob
}

const useSystems = (config) => {
  const { jobs } = useSelector((state: TapisState) => state.jobs);
  return {
    jobs,
    list: (params: ListJobsParams & Jobs.GetJobListRequest) => list(config, params.onList),
    submit: (params: SubmitJobsParams) => submit(config, params.onSubmit, params.request) 
  };
};

export default useSystems;
