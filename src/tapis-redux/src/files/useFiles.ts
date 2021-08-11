import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { FileListingCallback } from './types';
import { Files } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/src/types';
export interface ListFilesAdditionalParameters {
  onList?: FileListingCallback,
  request: Files.ListFilesRequest
}

const useFiles = (config?: Config) => {
  const { listings } = useSelector((state: TapisState) => state.files);
  return {
    listings,
    list: (params: ListFilesAdditionalParameters) => list(
      config, params.onList, params.request
    ),
  };
};

export default useFiles;
