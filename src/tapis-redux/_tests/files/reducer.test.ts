import { files } from 'tapis-redux/src/files/reducer';
import * as ACTIONS from 'tapis-redux/src/files/actionTypes';
import {
  FilesReducerState,
  FileListingRequest,
  FileListingFailure,
  FileListingSuccess
} from 'tapis-redux/src/files/types';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/src/constants/tapis';
import { fileInfo, filesStore } from 'fixtures/files.fixtures';

describe('Files reducer', () => {
  it('reduces a listing request for an existing path', () => {
    const request: FileListingRequest = {
      type: ACTIONS.TAPIS_FILES_LIST_REQUEST,
      payload: {
        systemId: 'system',
        path: '/'
      }
    }
    const state: FilesReducerState = files({ ...filesStore }, request);
    expect(state.listings).toStrictEqual({
      'system': {
        '/': {
          results: [ fileInfo ],
          loading: true,
          error: null,
          offset: 0,
          limit: TAPIS_DEFAULT_FILES_LISTING_LIMIT
        }
      }
    })
  });
  it('reduces a listing request for a new path', () => {
    const request: FileListingRequest = {
      type: ACTIONS.TAPIS_FILES_LIST_REQUEST,
      payload: {
        systemId: 'system2',
        path: '/dir'
      }
    }
    const state: FilesReducerState = files({ ...filesStore }, request);
    expect(state.listings['system2']).toStrictEqual({
      '/dir': {
        results: [],
        loading: true,
        error: null,
        offset: 0,
        limit: TAPIS_DEFAULT_FILES_LISTING_LIMIT
      }
    })
  });
  it('sets an error state for a listing', () => {
    const failure: FileListingFailure = {
      type: ACTIONS.TAPIS_FILES_LIST_FAILURE,
      payload: {
        systemId: 'system',
        path: '/',
        error: new Error("error")
      }
    }
    const store = { ...filesStore };
    store.listings['system']['/'].loading = true;
    const state: FilesReducerState = files(store, failure);
    expect(state.listings['system']['/']).toStrictEqual({
      results: [ fileInfo ],
      loading: false,
      error: new Error("error"),
      offset: 0,
      limit: TAPIS_DEFAULT_FILES_LISTING_LIMIT
    })
  });
  it('updates a file listing', () => {
    const success: FileListingSuccess = {
      type: ACTIONS.TAPIS_FILES_LIST_SUCCESS,
      payload: {
        incoming: [ fileInfo, fileInfo, fileInfo ],
        systemId: 'system',
        path: '/',
        offset: 1,
        limit: 3
      }
    }
    const store = { ...filesStore };
    store.listings['system']['/'].loading = true;
    const state: FilesReducerState = files(store, success);
    expect(state.listings['system']['/']).toStrictEqual({
      results: [ fileInfo, fileInfo, fileInfo, fileInfo ],
      loading: false,
      error: null,
      offset: 1,
      limit: 3
    });
  });
});