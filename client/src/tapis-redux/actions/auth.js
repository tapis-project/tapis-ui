import { put } from 'redux-saga/effects'

export const login = (username, password) => {
  put({
    type: 'TAPIS_AUTH_LOGIN',
    payload: {
      username,
      password
    }
  });
}

export const ACTIONS = {
  LOGIN: 'TAPIS_AUTH_LOGIN',
  LOGIN_START: 'TAPIS_AUTH_LOGIN_START',
  LOGIN_SUCCESS: 'TAPIS_AUTH_LOGIN_SUCCESS',
  LOGIN_FAILED: 'TAPIS_AUTH_LOGIN_FAILED'
}