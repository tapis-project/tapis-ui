import { jobs } from 'tapis-redux/jobs/reducer';
import { JobsReducerState } from 'tapis-redux/jobs/types';
import { TAPIS_DEFAULT_JOBS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import { jobInfo, jobsStore } from 'fixtures/jobs.fixtures';
import {
  JobsListingRequest,
  JobsListingFailure,
  JobsListingSuccess
} from 'tapis-redux/jobs/list/types';
import * as LIST_ACTIONS from 'tapis-redux/jobs/list/actionTypes';

describe('Jobs reducer', () => {
  it('reduces a listing request', () => {
    const request: JobsListingRequest = {
      type: LIST_ACTIONS.TAPIS_JOBS_LIST_REQUEST,
    }
    const state: JobsReducerState = jobs({ ...jobsStore }, request);
    expect(state.jobs).toStrictEqual({
      results: [ jobInfo ],
      loading: true,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_JOBS_LISTING_LIMIT
    })
  });

  it('sets an error state for a listing', () => {
    const failure: JobsListingFailure = {
      type: LIST_ACTIONS.TAPIS_JOBS_LIST_FAILURE,
      payload: {
        error: new Error("error")
      }
    }
    const store: JobsReducerState = { ...jobsStore };
    store.jobs.loading = true;
    const state: JobsReducerState = jobs(store, failure);
    expect(state.jobs).toStrictEqual({
      results: [ jobInfo ],
      loading: false,
      error: new Error("error"),
      offset: 0,
      limit: TAPIS_DEFAULT_JOBS_LISTING_LIMIT
    })
  });

  it('updates an jobs listing', () => {
    const success: JobsListingSuccess = {
      type: LIST_ACTIONS.TAPIS_JOBS_LIST_SUCCESS,
      payload: {
        incoming: [ jobInfo ],
        params: {}
      }
    }
    const store: JobsReducerState = { ...jobsStore };
    store.jobs.loading = true;
    const state: JobsReducerState = jobs(store, success);
    expect(state.jobs).toStrictEqual({
      results: [ jobInfo ],
      loading: false,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_JOBS_LISTING_LIMIT
    });
  });

  it('reduces job submissions', () => {
    //TODO job submission reducer tests
  });
});