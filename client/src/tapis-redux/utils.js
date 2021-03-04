import axios from 'axios';

const tapisFetch = ({ method, tenant, token, service, path, query }) => {
  return axios.request({
    method,
    url: `https://${tenant}/${service}${path}`,
    data: query,
    headers: {
      HTTP_JWT: token,
    },
  });
};

export default tapisFetch;
