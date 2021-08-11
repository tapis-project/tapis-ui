import { apiCall } from '../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Files } from '@tapis/tapis-typescript';
import {
  FileListingCallback
} from './types';
import { Config } from 'tapis-redux/types';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';

export const list = (config: Config = null, onList: FileListingCallback = null, request: Files.ListFilesRequest) => {

  const { systemId, path, offset, limit } = request;

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_FILES_LIST_REQUEST,
      payload: {
        systemId,
        path,
        offset,
        limit
      }  
    }
  }

  const onSuccess: OnSuccessCallback<Files.FileListingResponse> = (result) => {
    return {
      type: ACTIONS.TAPIS_FILES_LIST_SUCCESS,
      payload: {
        systemId,
        path,
        incoming: result.result,
        offset,
        limit
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_FILES_LIST_FAILURE,
      payload: {
        systemId,
        path,
        offset,
        limit,
        error
      }
    }
  }

  return apiCall<Files.FileListingResponse>({
    config,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Files,
    api: Files.FileOperationsApi,
    func: Files.FileOperationsApi.prototype.listFiles,
    args: [request]
  });
};
