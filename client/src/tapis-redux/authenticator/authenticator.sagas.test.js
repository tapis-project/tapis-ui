import { expectSaga } from 'redux-saga-test-plan';
import { tapisAuthPassword, authenticatorLogin } from './authenticator.sagas';
import { ACTIONS } from './authenticator.actions';
import { authenticatorToken, authenticatorStore, authenticatorResult } from './authenticator.fixtures';
import authenticator from './authenticator.reducer';
import * as matchers from "redux-saga-test-plan/matchers";

jest.mock('cross-fetch');

describe('Authenticator login saga', () => {
  it('runs saga', async () => {
    const apiCallback = jest.fn();
    const action = {
      type: ACTIONS.LOGIN.LOGIN,
      payload: {
        username: 'username',
        password: 'password',
        apiCallback
      }
    };
    // Make sure saga runs with correct sequence of events
    expectSaga(authenticatorLogin, action)
      .withReducer(authenticator)
      .provide([
        // Mock the call to tapisAuthPassword to return the fixture
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
    // Make sure callback fires
    expect(apiCallback.mock.calls[0][0]).toStrictEqual(authenticatorToken);
  });
});
