import axios from 'axios';

export const login = (authParams) => {
  return axios.request({
    method: 'post',
    url: '/oauth/app',
    data: authParams
  });
}
