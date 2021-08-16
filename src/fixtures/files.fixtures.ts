import { FilesReducerState } from 'tapis-redux/files/types';
import { Files } from '@tapis/tapis-typescript';
import { TAPIS_DEFAULT_FILES_LISTING_LIMIT } from 'tapis-redux/constants/tapis';

export const fileInfo: Files.FileInfo = {
  name: 'file1.txt',
  path: '/',
  size: 30,
  lastModified: new Date()
}

export const filesStore: FilesReducerState = {
  listings: {
    'system': {
      '/': {
        results: [ fileInfo ],
        loading: false,
        error: null,
        offset: 0,
        limit: TAPIS_DEFAULT_FILES_LISTING_LIMIT
      }
    }
  }
}