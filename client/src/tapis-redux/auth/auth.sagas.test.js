import { expectSaga } from 'redux-saga-test-plan';
import { authLogin } from './auth.sagas';
import { ACTIONS } from './auth.actions';
import { authSuccess, authStore } from './auth.fixtures';
import auth from './auth.reducer';
// import * as matchers from "redux-saga-test-plan/matchers";

jest.mock('cross-fetch');

describe('Auth login saga', () => {
  it('runs saga', async () => {
    const action = {
      type: ACTIONS.LOGIN.LOGIN,
    };
    expectSaga(authLogin, action)
      .withReducer(auth)
      .provide([
        // [matchers.call.fn(fetchLogin), authSuccess]
      ])
      .put({
        type: ACTIONS.LOGIN.START,
      })
      // .call(fetchLogin)
      .put({
        type: ACTIONS.LOGIN.SUCCESS,
        payload: authSuccess,
      })
      .hasFinalState(authStore)
      .run();
  });
});
