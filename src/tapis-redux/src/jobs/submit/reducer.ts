import * as ACTIONS from './actionTypes';
import { JobsReducer } from '../types';


export const submit: JobsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TAPIS_JOBS_SUBMIT_REQUEST:
      return {
        ...state,
        submission: {
          loading: true,
          error: null,
          result: null
        }
      };
    case ACTIONS.TAPIS_JOBS_SUBMIT_SUCCESS:
      return {
        ...state,
        submission: {
          loading: false,
          error: null,
          result: action.payload.result
        }
      };
    case ACTIONS.TAPIS_JOBS_SUBMIT_FAILURE:
      return {
        ...state,
        submission: {
          loading: false,
          error: action.payload.error,
          result: null
        }
      };
    case ACTIONS.TAPIS_JOBS_SUBMIT_RESET:
      return {
        ...state,
        submission: {
          loading: false,
          error: null,
          result: null
        }
      }
    default:
      return state;
  }
}
