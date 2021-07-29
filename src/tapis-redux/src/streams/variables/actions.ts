import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";
import { VariablesListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';

// Create a 'list' dispatch generator
export const list = (config: Config = null, params: Streams.ListVariablesRequest, onList: VariablesListCallback = null) => {

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_VARIABLES_LIST_REQUEST,
      payload: {
        params
      }
    }
  }

  const onSuccess: OnSuccessCallback<Streams.RespListVariables> = (result) => {
    return {
      type: ACTIONS.TAPIS_VARIABLES_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_VARIABLES_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Streams.RespListVariables>({
    config,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Streams,
    api: Streams.VariablesApi,
    func: Streams.VariablesApi.prototype.listVariables,
    args: [params]
  });
};

export const select = (site: Streams.Site) => {
  return {
    type: ACTIONS.TAPIS_SELECT_VARIABLE,
    payload: site
  }
};