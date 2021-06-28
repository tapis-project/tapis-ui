import { jobs } from 'tapis-redux/jobs/reducer';
import { JobsReducerState } from 'tapis-redux/jobs/types';
import { jobInfo, jobsStore } from 'fixtures/jobs.fixtures';
import {
  JobsSubmitRequest,
  JobsSubmitFailure,
  JobsSubmitSuccess
} from 'tapis-redux/jobs/submit/types';
import * as SUBMIT_ACTIONS from 'tapis-redux/jobs/submit/actionTypes';

describe('Jobs Submit reducer', () => {
  it('reduces a submit request', () => {
    const request: JobsSubmitRequest = {
      type: SUBMIT_ACTIONS.TAPIS_JOBS_SUBMIT_REQUEST,
    }
    const state: JobsReducerState = jobs({ ...jobsStore }, request);
    expect(state.submission).toStrictEqual({
      result: null,
      loading: true,
      error: null,
    })
  });

  it('sets an error state for a submission', () => {
    const failure: JobsSubmitFailure = {
      type: SUBMIT_ACTIONS.TAPIS_JOBS_SUBMIT_FAILURE,
      payload: {
        error: new Error("error")
      }
    }
    const store: JobsReducerState = { ...jobsStore };
    store.submission.loading = true;
    const state: JobsReducerState = jobs(store, failure);
    expect(state.submission).toStrictEqual({
      result: null,
      loading: false,
      error: new Error("error"),
    })
  });

  it('processes a job submission', () => {
    const success: JobsSubmitSuccess = {
      type: SUBMIT_ACTIONS.TAPIS_JOBS_SUBMIT_SUCCESS,
      payload: {
        result: {
          'uuid': 'mock_uuid'
        }
      }
    }
    const store: JobsReducerState = { ...jobsStore };
    store.jobs.loading = true;
    const state: JobsReducerState = jobs(store, success);
    expect(state.submission).toStrictEqual({
      result: { 'uuid': 'mock_uuid' },
      loading: false,
      error: null,
    });
  });
});