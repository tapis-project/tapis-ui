import { apps } from 'tapis-redux/apps/reducer';
import { AppsReducerState } from 'tapis-redux/apps/types';
import { TAPIS_DEFAULT_APPS_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import { tapisApp, appsStore } from 'fixtures/apps.fixtures';
import {
  AppsListingRequest,
  AppsListingFailure,
  AppsListingSuccess
} from 'tapis-redux/apps/list/types';
import * as LIST_ACTIONS from 'tapis-redux/apps/list/actionTypes';

describe('Apps reducer', () => {
  it('reduces a listing request', () => {
    const request: AppsListingRequest = {
      type: LIST_ACTIONS.TAPIS_APPS_LIST_REQUEST,
    }
    const state: AppsReducerState = apps({ ...appsStore }, request);
    expect(state.apps).toStrictEqual({
      results: [ tapisApp ],
      loading: true,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_APPS_LISTING_LIMIT
    })
  });

  it('sets an error state for a listing', () => {
    const failure: AppsListingFailure = {
      type: LIST_ACTIONS.TAPIS_APPS_LIST_FAILURE,
      payload: {
        error: new Error("error")
      }
    }
    const store: AppsReducerState = { ...appsStore };
    store.apps.loading = true;
    const state: AppsReducerState = apps(store, failure);
    expect(state.apps).toStrictEqual({
      results: [ tapisApp ],
      loading: false,
      error: new Error("error"),
      offset: 0,
      limit: TAPIS_DEFAULT_APPS_LISTING_LIMIT
    })
  });

  it('updates an apps listing', () => {
    const success: AppsListingSuccess = {
      type: LIST_ACTIONS.TAPIS_APPS_LIST_SUCCESS,
      payload: {
        incoming: [ tapisApp ],
        params: {}
      }
    }
    const store: AppsReducerState = { ...appsStore };
    store.apps.loading = true;
    const state: AppsReducerState = apps(store, success);
    expect(state.apps).toStrictEqual({
      results: [ tapisApp ],
      loading: false,
      error: null,
      offset: 0,
      limit: TAPIS_DEFAULT_APPS_LISTING_LIMIT
    });
  });
});