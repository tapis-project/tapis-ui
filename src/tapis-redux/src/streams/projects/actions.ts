import { apiCall } from '../../sagas/actions';
import * as ACTIONS from './actionTypes';
import { Streams } from "@tapis/tapis-typescript";
import { ProjectsListCallback } from './types';
import {
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config } from 'tapis-redux/types';

// Create a 'list' dispatch generator
export const list = (config: Config = null, onList: ProjectsListCallback = null, params: Streams.ListProjectsRequest = {}) => {

  const onRequest: OnRequestCallback = () => {
    return {
      type: ACTIONS.TAPIS_PROJECTS_LIST_REQUEST,
    }
  }

  const onSuccess: OnSuccessCallback<Streams.RespListProjects> = (result) => {
    return {
      type: ACTIONS.TAPIS_PROJECTS_LIST_SUCCESS,
      payload: {
        params,
        incoming: result.result
      }
    }
  }

  const onFailure: OnFailureCallback = (error) => {
    return {
      type: ACTIONS.TAPIS_PROJECTS_LIST_FAILURE,
      payload: {
        error,
        params
      }
    }
  }

  return apiCall<Streams.RespListProjects>({
    config,
    onApi: onList,
    onRequest,
    onSuccess,
    onFailure,
    module: Streams,
    api: Streams.ProjectsApi,
    func: Streams.ProjectsApi.prototype.listProjects,
    args: [params]
  });
};

export const select = (project: Streams.Project) => {
  return {
    type: ACTIONS.TAPIS_SELECT_PROJECT,
    payload: project
  }
}
