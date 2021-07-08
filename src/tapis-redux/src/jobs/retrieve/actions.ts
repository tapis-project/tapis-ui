import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Jobs } from '@tapis/tapis-typescript';
import { JobRetrieveCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';


// Create a 'getJob' dispatch generator
export const retrieve = (config: Config = null, onRetrieve: JobRetrieveCallback = null, params: Jobs.GetJobRequest) => {
  // The job is retrieved with the callback, but results are not cached in a reducer
  const onRequest: OnRequestCallback = null;
  const onSuccess: OnSuccessCallback<Jobs.RespGetJob> = null;
  const onFailure: OnFailureCallback = null

  return apiCall<Jobs.RespGetJob>({
    config,
    onApi: onRetrieve,
    onRequest,
    onSuccess,
    onFailure,
    module: Jobs,
    api: Jobs.JobsApi,
    func: Jobs.JobsApi.prototype.getJob,
    args: [params]
  });
};
