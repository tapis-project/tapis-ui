import { useSelector } from 'react-redux';
import { list } from './list/actions';
import { resetSubmit, submit } from './submit/actions';
import { TapisState } from '../store/rootReducer';
import { JobsListCallback } from './list/types';
import { JobsSubmitCallback } from './submit/types';
import { Jobs } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';

export interface ListJobsParams {
  onList?: JobsListCallback
  request?: Jobs.GetJobListRequest
}

export interface SubmitJobsParams {
  onSubmit?: JobsSubmitCallback
  request: Jobs.ReqSubmitJob
}

const useSystems = (config: Config = null) => {
  const { jobs, submission } = useSelector((state: TapisState) => state.jobs);
  return {
    jobs,
    submission,
    list: (params: ListJobsParams) => list(config, params.onList, params.request),
    submit: (params: SubmitJobsParams) => submit(config, params.onSubmit, params.request),
    resetSubmit: () => resetSubmit()
  };
};

export default useSystems;
