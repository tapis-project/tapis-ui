import { Files } from '@tapis/tapis-typescript';
import { errorDecoder } from '../utils';
import axios from 'axios';

/**
 * Where an uploaded file lands.
 *
 * Joined rather than concatenated. This was `${path}${file.name}`, which
 * needs every caller to hand over a path with a trailing slash — the upload
 * modal did, by appending one and de-duplicating it; the listing's
 * drag-and-drop did not, and wrote /outtapisjob.out into the parent.
 */
export const uploadUrl = (
  basePath: string,
  systemId: string,
  path: string,
  name: string
): string => {
  const target = [path, name]
    .map((part) => (part ?? '').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return `${basePath}/v3/files/ops/${systemId}/${target}`;
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
