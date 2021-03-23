import axios from 'axios';

const tapisFetch = ({ method, token, service, path, params, tenant, data }) => {
  const baseUrl = tenant || process.env.TAPIS_TENANT_URL;
  return axios.request({
    method,
    url: `${baseUrl}/${service}${path}`,
    params,
    data,
    headers: {
      'X-Tapis-Token': token,
    },
  });
};

export default tapisFetch;
