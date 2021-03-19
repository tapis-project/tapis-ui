import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import tapisFetch from '../utils';
import { apiSagaHelper } from './api.sagas';
import ACTIONS from './api.actions';

jest.mock('cross-fetch');

describe('API Saga Helper', () => {
  it('runs saga with default configuration', async () => {
    const dispatches = {
      START: 'API_START',
      SUCCESS: 'API_SUCCESS',
      ERROR: 'API_ERROR'
    }
    const apiCallback = jest.fn();
    const apiParams = {
      method: 'post',
      service: 'service',
      path: 'path',
      params: { 'q': 'query' },
      data: { 'key': 'value' }
    }
    const responseParser = result => result.data.result.value;
    const payload = {
      dispatches,
      apiCallback,
      apiParams,
      responseParser
    }
    const action = {
      type: ACTIONS.API.CALL,
      payload
    }
    const apiResult = {
      data: {
        result: {
          value: {
            'tapis': 'object'
          }
        }
      }
    }
    // Make sure saga runs with correct sequence of events
    expectSaga(apiSagaHelper, action)
      .withState({
        authenticator: {
          token: {
            access_token: 'mock_access_token'
          }
        }
      })
      .provide([
        // Mock the call to tapisFetch to return the fixture
        [matchers.call.fn(tapisFetch), apiResult]
      ])
      .put({
        type: 'API_START',
      })
      .call(
        tapisFetch,
        {
          method: 'post',
          token: 'mock_access_token',
          service: 'service',
          path: 'path',
          params: { 'q': 'query' },
          tenant: process.env.TAPIS_TENANT_URL,
          data: { 'key': 'value' },
        }
      )
      .put({
        type: 'API_SUCCESS',
        payload: {'tapis': 'object'},
      })
      .run();
    // Make sure callback fires
    expect(apiCallback.mock.calls[0][0]).toStrictEqual({'tapis': 'object'});
  });

  it('runs saga with provided configuration', async () => {
    const config = {
      token: {
        access_token: 'provided_token',
      },
      tenant: 'https://tenant.url'
    }
    const dispatches = {
      START: 'API_START',
      SUCCESS: 'API_SUCCESS',
      ERROR: 'API_ERROR'
    }
    const apiCallback = jest.fn();
    const apiParams = {
      method: 'post',
      service: 'service',
      path: 'path',
      params: { 'q': 'query' },
      data: { 'key': 'value' }
    }
    const responseParser = result => result.data.result.value;
    const payload = {
      dispatches,
      apiCallback,
      apiParams,
      responseParser,
      config
    }
    const action = {
      type: ACTIONS.API.CALL,
      payload
    }
    const apiResult = {
      data: {
        result: {
          value: {
            'tapis': 'object'
          }
        }
      }
    }
    // Make sure saga runs with correct sequence of events
    expectSaga(apiSagaHelper, action)
      .withState({
        authenticator: {
          token: {
            access_token: 'mock_access_token'
          }
        }
      })
      .provide([
        // Mock the call to tapisFetch to return the fixture
        [matchers.call.fn(tapisFetch), apiResult]
      ])
      .put({
        type: 'API_START',
      })
      .call(
        tapisFetch,
        {
          method: 'post',
          token: 'provided_token',
          service: 'service',
          path: 'path',
          params: { 'q': 'query' },
          tenant: 'https://tenant.url',
          data: { 'key': 'value' },
        }
      )
      .put({
        type: 'API_SUCCESS',
        payload: {'tapis': 'object'},
      })
      .run();
    // Make sure callback fires
    expect(apiCallback.mock.calls[0][0]).toStrictEqual({'tapis': 'object'});
  });

});
