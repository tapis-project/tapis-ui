import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Apps } from '@tapis/tapis-typescript';
import { AppsListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/src/sagas/types';
import { Config } from 'tapis-redux/src/types';


// Create a 'list' dispatch generator
export const list = (config: Config | null = null, onList: AppsListCallback = () => {}, params: Apps.GetAppsRequest = {}) => {
  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_APPS_LIST_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Apps.RespApps> = (result) => {
    return {
      type: ACTIONS.TAPIS_APPS_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_APPS_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Apps.RespApps>({
    config: config ?? undefined,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Apps,
    api: Apps.ApplicationsApi,
    func: Apps.ApplicationsApi.prototype.getApps,
    args: [params]
  });
};
