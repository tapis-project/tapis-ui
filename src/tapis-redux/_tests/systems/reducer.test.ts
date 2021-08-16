import { systems } from 'tapis-redux/systems/reducer';
import * as ACTIONS from 'tapis-redux/systems/actionTypes';
import {
  SystemsReducerState,
  SystemsListingRequest,
  SystemsListingSuccess,
  SystemsListingFailure 
} from 'tapis-redux/systems/types';
import { TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import { tapisSystem, systemsStore } from 'fixtures/systems.fixtures';

describe('Systems reducer', () => {
  it('reduces a listing request', () => {
    const request: SystemsListingRequest = {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_REQUEST,
    }
    const state: SystemsReducerState = systems({ ...systemsStore }, request);
    expect(state.systems).toStrictEqual({
      results: [ tapisSystem ],
      loading: true,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT
    })
  });
  it('sets an error state for a listing', () => {
    const failure: SystemsListingFailure = {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_FAILURE,
      payload: {
        error: new Error("error")
      }
    }
    const store = { ...systemsStore };
    store.systems.loading = true;
    const state: SystemsReducerState = systems(store, failure);
    expect(state.systems).toStrictEqual({
      results: [ tapisSystem ],
      loading: false,
      error: new Error("error"),
      offset: 0,
      limit: TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT
    })
  });
  it('updates a system listing', () => {
    const success: SystemsListingSuccess = {
      type: ACTIONS.TAPIS_SYSTEMS_LIST_SUCCESS,
      payload: {
        incoming: [ tapisSystem, tapisSystem, tapisSystem ],
        params: {}
      }
    }
    const store = { ...systemsStore };
    store.systems.loading = true;
    const state: SystemsReducerState = systems(store, success);
    expect(state.systems).toStrictEqual({
      results: [ tapisSystem, tapisSystem, tapisSystem ],
      loading: false,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_SYSTEMS_LISTING_LIMIT
    });
  });
});