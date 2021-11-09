import { Files } from '@tapis/tapis-typescript';
import { errorDecoder } from 'tapis-api/utils';
import axios from 'axios';

const insert = (
  systemId: string,
  path: string,
  file: File,
  basePath: string,
  jwt: string
): Promise<Files.FileStringResponse> => {
  const url = `${basePath}/v3/files/ops/${systemId}/${path}${file.name}`;
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'content-type': 'multipart/form-data',
      'X-Tapis-Token': jwt,
    },
  };

  console.log('Response', axios.post(url, formData, config));

  return errorDecoder<Files.FileStringResponse>(() =>
    axios.post(url, formData, config)
  );
};

export default insert;
