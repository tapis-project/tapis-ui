import { expectSaga } from 'redux-saga-test-plan';
import { systemsList, systemsListResponseParser } from './systems.sagas';
import { ACTIONS } from './systems.actions';
import API_ACTIONS from '../sagas/api.actions';
jest.mock('cross-fetch');

describe('Systems listing saga', () => {
  it('runs saga', async () => {
    const action = {
      type: ACTIONS.LIST.LIST,
      payload: {}
    };
    return (
      expectSaga(systemsList, action)
        .put({
          type: API_ACTIONS.API.CALL,
          payload: {
            apiParams: {
              method: 'get',
              service: 'systems',
              path: '/'
            },
            config: undefined,
            onApi: undefined,
            dispatches: ACTIONS.LIST,
            responseParser: systemsListResponseParser
          }
        })
        .run()
    );
  });
});
