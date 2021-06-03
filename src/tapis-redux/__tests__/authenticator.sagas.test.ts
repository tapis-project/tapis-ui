import { expectSaga } from 'redux-saga-test-plan';
import { tapisAuth, authenticatorLogin } from 'tapis-redux/authenticator/sagas';
import * as ACTIONS from 'tapis-redux/authenticator/actionTypes';
import { AuthenticatorLoginRequest } from 'tapis-redux/authenticator/types';
import { authenticatorToken, authenticatorStore } from 'fixtures/authenticator.fixtures';
import { authenticator } from 'tapis-redux/authenticator/reducer';
import * as matchers from "redux-saga-test-plan/matchers";

jest.mock('cross-fetch');

describe('Authenticator login saga', () => {
  it('runs saga', async () => {
    const onAuth = jest.fn();
    const action: AuthenticatorLoginRequest = {
      type: ACTIONS.TAPIS_AUTH_LOGIN_REQUEST,
      payload: {
        username: 'username',
        password: 'password',
        onAuth
      }
    };
    // Make sure saga runs with correct sequence of events
    expectSaga(authenticatorLogin, action)
      .withReducer(authenticator)
      .provide([
        // Mock the call to tapisAuthPassword to return the fixture
        [matchers.call.fn(tapisAuth), authenticatorToken]
      ])
      .call(tapisAuth, { username: 'username', password: 'password', onAuth })
      .put({
        type: ACTIONS.TAPIS_AUTH_LOGIN_SUCCESS,
        payload: authenticatorToken,
      })
      .call(onAuth, authenticatorToken)
      .hasFinalState(authenticatorStore)
      .run();
    // Make sure callback fires
    expect(onAuth.mock.calls[0][0]).toStrictEqual(authenticatorToken);
  });
});