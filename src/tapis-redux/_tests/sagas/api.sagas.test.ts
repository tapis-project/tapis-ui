import { expectSaga } from 'redux-saga-test-plan';
import { apiSaga } from 'tapis-redux/sagas/sagas';
import {
  ApiSagaDispatch,
  ApiDispatches,
  ApiSagaRequest,
  OnRequestCallback,
  OnSuccessCallback,
  OnFailureCallback
} from 'tapis-redux/sagas/types';
import { Config, ApiCallback } from 'tapis-redux/types';
import * as ACTIONS from 'tapis-redux/sagas/actionTypes';

jest.mock('cross-fetch');

// Mock API with jest mocks
type MockReturnType = {
  value: string
};

const mockReturn: MockReturnType = {
  value: 'mock_return'
}

const Configuration = jest.fn();
const mockFunctionSpy = jest.fn();
const callbackSpy = jest.fn();
const mockFunction = (...args: any[]): MockReturnType => {
  // Call the jest mockFunctionSpy with the passed arguments from the dispatch
  mockFunctionSpy(...args)
  // Return a value, that will be received by onApi and the callbackSpy
  return mockReturn;
}
const mockApiInstance = {
  mockFunction
}

// Mocked API that contains a function to be called by name
const MockApi = jest.fn().mockImplementation(() => mockApiInstance);

// mock configuration
const config: Config = {
  jwt: 'mock_jwt',
  tenant: 'mock.api'
}

// onApi callback that passes the result to the jest observer
const onApi: ApiCallback<MockReturnType> = (result) => {
  callbackSpy(result);
}

// Args to pass to the called function
const args = [
  'arg1',
  'arg2'
]

// callbacks
const onRequest: OnRequestCallback = () => {
  return {
    type: 'mock_request'
  }
}

const onSuccess: OnSuccessCallback = (results) => {
  return {
    type: 'mock_success',
    payload: results
  }
}

const onFailure: OnFailureCallback = (error) => {
  return {
    type: 'mock_failure',
    payload: {
      error
    }
  }
}

describe('API Saga Helper', () => {
  beforeEach(() => {
    Configuration.mockReset();
    mockFunctionSpy.mockReset();
    callbackSpy.mockReset();
  });
  it('runs saga with default configuration', async () => {
    const dispatch: ApiSagaDispatch<MockReturnType> = {
      onSuccess,
      onRequest,
      onFailure,
      onApi,
      module: {
        Configuration
      },
      api: MockApi,
      func: mockFunction,
      args
    }
    
    const action: ApiSagaRequest<MockReturnType> = {
      type: ACTIONS.TAPIS_REDUX_API_REQUEST,
      payload: dispatch
    }

    // Make sure saga runs with correct sequence of events
    const sagaTest = expectSaga(apiSaga, action)
      .withState({
        authenticator: {
          token: {
            access_token: 'mock_access_token'
          }
        }
      })
      .put({
        type: 'mock_request',
      })
      .run();
    // Make sure Configuration was set to default config
    expect(Configuration.mock.calls[0][0]).toStrictEqual({
      basePath: process.env.REACT_APP_TAPIS_TENANT_URL,
      headers: {
        "X-Tapis-Token": "mock_access_token"
      }
    })
    // Make sure callback fired
    expect(callbackSpy.mock.calls[0][0]).toStrictEqual(mockReturn);
    return sagaTest;
  });
  it('runs saga with provided configuration', async () => {
    const dispatch: ApiSagaDispatch<MockReturnType> = {
      onRequest,
      onSuccess,
      onFailure,
      config,
      onApi,
      module: {
        Configuration
      },
      api: MockApi,
      func: mockFunction,
      args
    }
    
    const action: ApiSagaRequest<MockReturnType> = {
      type: ACTIONS.TAPIS_REDUX_API_REQUEST,
      payload: dispatch
    }

    // Make sure saga runs with correct sequence of events
    const sagaTest = expectSaga(apiSaga, action)
      .withState({
        authenticator: {
          token: {
            access_token: 'mock_access_token'
          }
        }
      })
      .put({
        type: 'mock_request',
      })
      .run();
    // Make sure Configuration was set to default config
    expect(Configuration.mock.calls[0][0]).toStrictEqual({
      basePath: "mock.api",
      headers: {
        "X-Tapis-Token": "mock_jwt"
      }
    })
    // Make sure callback fired
    expect(callbackSpy.mock.calls[0][0]).toStrictEqual(mockReturn);
    return sagaTest;
  });
});