import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const changeOwner = (
  params: Systems.ChangeSystemOwnerRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespChangeCount>(() =>
    api.changeSystemOwner(params)
  );
};

export default changeOwner;
