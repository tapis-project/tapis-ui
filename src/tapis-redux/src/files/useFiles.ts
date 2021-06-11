import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { FileListingCallback } from './types';
import { Files } from '@tapis/tapis-typescript';

export interface ListFilesAdditionalParameters {
  onList?: FileListingCallback
}

const useFiles = (config) => {
  const { listings } = useSelector((state: TapisState) => state.files);
  return {
    listings,
    list: (params: ListFilesAdditionalParameters & Files.ListFilesRequest) => list(
      params.systemId, params.path, params.offset, params.limit, config, params.onList
    ),
  };
};

export default useFiles;
