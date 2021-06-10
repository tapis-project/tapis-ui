import { files } from 'tapis-redux/files/reducer';
import * as ACTIONS from 'tapis-redux/files/actionTypes';
import { FilesReducerState, FileListingRequest } from 'tapis-redux/files/types';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';
import { fileInfo, filesStore } from 'fixtures/files.fixtures';

describe('Files reducer', () => {
  let initialState: FilesReducerState = { ...filesStore };
  beforeEach(() => {
    initialState = { ...filesStore };
  });
  it('reduces a listing request for an existing path', () => {
    const request: FileListingRequest = {
      type: ACTIONS.TAPIS_FILES_LIST_REQUEST,
      payload: {
        systemId: 'system',
        path: '/'
      }
    }
    const state: FilesReducerState = files(initialState, request);
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
    const state: FilesReducerState = files(initialState, request);
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
});