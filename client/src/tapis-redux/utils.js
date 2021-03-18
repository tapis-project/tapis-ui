import axios from 'axios';

const tapisFetch = ({ method, token, service, path, params, tenant, data }) => {
  const baseUrl = tenant || process.env.TAPIS_TENANT_URL;
  return axios.request({
    method,
    url: `https://${baseUrl}/${service}${path}`,
    params,
    data,
    headers: {
      HTTP_JWT: token,
    },
  });
};

export default tapisFetch;
