import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listDownloadLinks = (
  params: Models.DownloadModelRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.RespModelDownload>(() =>
    api.downloadModel(params)
  );
};

export default listDownloadLinks;
