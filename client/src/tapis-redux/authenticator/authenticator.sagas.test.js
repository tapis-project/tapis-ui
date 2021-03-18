import { expectSaga } from 'redux-saga-test-plan';
import { tapisAuthPassword, authenticatorLogin } from './authenticator.sagas';
import { ACTIONS } from './authenticator.actions';
import { authenticatorToken, authenticatorStore, authenticatorResult } from './authenticator.fixtures';
import authenticator from './authenticator.reducer';
import * as matchers from "redux-saga-test-plan/matchers";

jest.mock('cross-fetch');

describe('Authenticator login saga', () => {
  it('runs saga', async () => {
    const action = {
      type: ACTIONS.LOGIN.LOGIN,
      payload: {
        username: 'username',
        password: 'password'
      }
    };
    expectSaga(authenticatorLogin, action)
      .withReducer(authenticator)
      .provide([
        [matchers.call.fn(tapisAuthPassword), authenticatorResult]
      ])
      .put({
        type: ACTIONS.LOGIN.START,
      })
      .call(tapisAuthPassword, { username: 'username', password: 'password', authenticator: undefined })
      .put({
        type: ACTIONS.LOGIN.SUCCESS,
        payload: authenticatorToken,
      })
      .hasFinalState(authenticatorStore)
      .run();
  });
});
