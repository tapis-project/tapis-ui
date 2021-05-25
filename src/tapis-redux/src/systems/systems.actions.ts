import { apiCall } from '../sagas/api.actions';
import {
  TAPIS_SYSTEMS_LIST_REQUEST, 
  TAPIS_SYSTEMS_LIST_FAILURE, 
  TAPIS_SYSTEMS_LIST_SUCCESS
} from './actionTypes';
import { Systems } from '@tapis/tapis-typescript';

export const list = (config, onApi) => {
  // Generate a dispatch that calls the API saga with
  // a systems listing payload
  const request: Systems.GetSystemsRequest = {};
  return apiCall<Systems.RespSystems>({
    config,
    onApi,
    dispatches: {
      request: TAPIS_SYSTEMS_LIST_REQUEST,
      success: TAPIS_SYSTEMS_LIST_SUCCESS,
      failure: TAPIS_SYSTEMS_LIST_FAILURE
    },
    module: Systems,
    api: Systems.SystemsApi,
    fnName: 'getSystems',
    args: [request]
  });
};
