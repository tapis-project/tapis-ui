import { Files } from '@tapis/tapis-typescript';
import { errorDecoder } from '../utils';
import axios from 'axios';

/** Upload URL for a file. Path and name are joined, so the path needs no trailing slash. */
export const uploadUrl = (
  basePath: string,
  systemId: string,
  path: string,
  name: string
): string => {
  // encode each segment separately so '#', '?' and '%' in a name stay in the name; '/' separators are kept
  const target = [path, name]
    .flatMap((part) => (part ?? '').split('/'))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return `${basePath}/v3/files/ops/${encodeURIComponent(systemId)}/${target}`;
};

const insert = (
  systemId: string,
  path: string,
  file: File,
  basePath: string,
  jwt: string,
  progressCallback?: (progress: number, file: File) => void
): Promise<Files.FileStringResponse> => {
  const url = uploadUrl(basePath, systemId, path, file.name);
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
