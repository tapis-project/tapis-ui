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