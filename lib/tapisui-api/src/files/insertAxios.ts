import { Files } from '@tapis/tapis-typescript';
import { errorDecoder } from '../utils';
import axios from 'axios';

const insert = (
  systemId: string,
  path: string,
  file: File,
  basePath: string,
  jwt: string,
  progressCallback?: (progress: number, file: File) => void
): Promise<Files.FileStringResponse> => {
  const url = `${basePath}/v3/files/ops/${systemId}/${path}${file.name}`;
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'content-type': 'multipart/form-data',
      'X-Tapis-Token': jwt,
    },
    onUploadProgress: (progressEvent: any) => {
      if (progressCallback) {
        let progress: number = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        progressCallback(progress, file);
      }
    },
  };

  return errorDecoder<Files.FileStringResponse>(() =>
    axios.post(url, formData, config)
  );
};

export default insert;
