import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from "redux-saga-test-plan/matchers";
import { apiSaga } from '../sagas/api.sagas';
import { list, ACTIONS } from './streams.actions';
import { streams } from './streams.reducer';
import { listingResponse, listingResult, streamssStore } from './streams.fixtures';
import getToken from '../authenticator/authenticator.selectors';
import tapisFetch from '../utils';

describe('Streams Project listing saga', () => {
  it('runs saga', async () => {
    // Generate an api call with a custom configuration and callback
    const config = {
      token: {
        access_token: 'provided_token',
      },
      tenant: 'https://tenant.url'
    }
    const onApi = jest.fn();
    const action = list(config, onApi);

    // Make sure saga runs with correct sequence of events
    expectSaga(apiSaga, action)
      .withReducer(streams)
      // Mock the call to tapisFetch to return the streams listing fixture
      .provide([
        [matchers.call.fn(tapisFetch), listingResponse],
        [matchers.select.selector(getToken), { access_token: 'default_token' }]
      ])
      .put({
        type: ACTIONS.LIST.START,
      })
      // Assert that the correct api call is made
      .call(
        tapisFetch,
        {
          method: 'get',
          token: 'provided_token',
          service: 'streams',
          path: '/projects',
          params: undefined,
          tenant: 'https://tenant.url',
          data: undefined,
        }
      )
      // Assert that the streamsStore listing action contains a parsed result
      .put({
        type: ACTIONS.LIST.SUCCESS,
        payload: listingResult,
      })
      // Assert that the onApi callback happens with the result
      .call(onApi, listingResult)
      // Assert that the reducer correctly builds the new streams listing state
      .hasFinalState(streamsStore)
      .run();
    // Make sure callback fires
    expect(onApi.mock.calls[0][0]).toStrictEqual(listingResult);
  });
});
