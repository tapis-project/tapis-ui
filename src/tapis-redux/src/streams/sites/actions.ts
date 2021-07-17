import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";
import { SitesListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';
// Create a 'list' dispatch generator
export const list = (config: Config = null, params: Streams.ListSitesRequest, onList: SitesListCallback = null) => {

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_SITES_LIST_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Streams.RespListSites> = (result) => {
    return {
      type: ACTIONS.TAPIS_SITES_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_SITES_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Streams.RespListSites>({
    config,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Streams,
    api: Streams.SitesApi,
    func: Streams.SitesApi.prototype.listSites,
    args: [params]
  });
};
