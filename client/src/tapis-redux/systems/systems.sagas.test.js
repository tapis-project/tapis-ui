import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { systemsList } from './systems.sagas';
import { ACTIONS } from './systems.actions';
import { listingSuccess, systemsStore } from './systems.fixtures';
import systems from './systems.reducer';
import getToken from '../auth/auth.selectors';

jest.mock('cross-fetch');

describe('Systems listing saga', () => {
  it('runs saga, when user is logged in', async () => {
    const action = {
      type: ACTIONS.LIST.LIST,
    };
    return (
      expectSaga(systemsList, action)
        .withReducer(systems)
        .provide([[matchers.select.selector(getToken), '1234']])
        .select(getToken)
        .put({
          type: ACTIONS.LIST.START,
        })
        // .call(fetchSystems)
        .put({
          type: ACTIONS.LIST.SUCCESS,
          payload: listingSuccess,
        })
        .hasFinalState(systemsStore)
        .run()
    );
  });

  it('runs saga, when token is provided', async () => {
    const action = {
      type: ACTIONS.LIST.LIST,
      payload: {
        token: '1234',
      },
    };
    return (
      expectSaga(systemsList, action)
        .withReducer(systems)
        .put({
          type: ACTIONS.LIST.START,
        })
        // .call(fetchSystems)
        .put({
          type: ACTIONS.LIST.SUCCESS,
          payload: listingSuccess,
        })
        .hasFinalState(systemsStore)
        .run()
    );
  });

  it('fails to run saga, when no token is provided and not logged in', async () => {
    const action = {
      type: ACTIONS.LIST.LIST,
      payload: {},
    };
    return expectSaga(systemsList, action)
      .withReducer(systems)
      .provide([[matchers.select.selector(getToken), null]])
      .select(getToken)
      .put({
        type: ACTIONS.LIST.FAILED,
        payload: 'tapis-redux not logged in',
      })
      .hasFinalState({
        definitions: {},
        loading: false,
        error: null,
        failed: true,
      })
      .run();
  });
});
