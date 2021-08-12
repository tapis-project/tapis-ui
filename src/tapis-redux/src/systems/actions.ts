import { apiCall } from '../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Systems } from '@tapis/tapis-typescript';
import { SystemsListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/src/sagas/types';
import { Config } from 'tapis-redux/src/types';

// Create a 'list' dispatch generator
export const list = (config: Config | null = null, onList: SystemsListCallback = () => {}, params: Systems.GetSystemsRequest = {}) => {
  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Systems.RespSystems> = (result) => {
    return {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Systems.RespSystems>({
    config: config ?? undefined,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Systems,
    api: Systems.SystemsApi,
    func: Systems.SystemsApi.prototype.getSystems,
    args: [params]
  });
};
