import axios from 'axios';

const login = authParams => {
  return axios.request({
    method: 'post',
    url: '/oauth/app',
    data: authParams
  });
};

export default login;
