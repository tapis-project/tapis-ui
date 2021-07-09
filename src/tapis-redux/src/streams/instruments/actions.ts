import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import * as Streams from "@tapis/tapis-typescript-streams"
import { InstrumentsListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';
import { ListInstrumentsRequest } from '@tapis/tapis-typescript-streams';

// Create a 'list' dispatch generator
export const list = (config: Config = null, params: ListInstrumentsRequest, onList: InstrumentsListCallback = null) => {

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_INSTRUMENTS_LIST_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Streams.RespListInstruments> = (result) => {
    return {
      type: ACTIONS.TAPIS_INSTRUMENTS_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_INSTRUMENTS_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Streams.RespListInstruments>({
    config,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Streams,
    api: Streams.InstrumentsApi,
    func: Streams.InstrumentsApi.prototype.listInstruments,
    args: [params]
  });
};
