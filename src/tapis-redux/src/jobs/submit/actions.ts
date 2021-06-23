import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Jobs } from '@tapis/tapis-typescript';
import { JobsSubmitCallback, JobsSubmitReset } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';


export const resetSubmit = (): JobsSubmitReset => {
  return {
    type: ACTIONS.TAPIS_JOBS_SUBMIT_RESET,
    payload: {}
  }
}

// Create a 'list' dispatch generator
export const submit = (config: Config = null, onSubmit: JobsSubmitCallback = null, params: Jobs.ReqSubmitJob) => {
  const request: Jobs.SubmitJobRequest = {
    reqSubmitJob: params
  }

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_JOBS_SUBMIT_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Jobs.RespSubmitJob> = (result) => {
    return {
      type: ACTIONS.TAPIS_JOBS_SUBMIT_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_JOBS_SUBMIT_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Jobs.RespSubmitJob>({
    config,
    onApi: onSubmit,
    onRequest,
    onSuccess,
    onFailure,
    module: Jobs,
    api: Jobs.JobsApi,
    func: Jobs.JobsApi.prototype.submitJob,
    args: [request]
  });
};
