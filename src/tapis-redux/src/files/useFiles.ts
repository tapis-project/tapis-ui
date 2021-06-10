import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { FileListingCallback } from './types';

const useFiles = (config) => {
  const { listings } = useSelector((state: TapisState) => state.files);
  return {
    listings,
    list: (onList: FileListingCallback, systemId: string, 
      path: string, offset?: number, limit?: number) => list(systemId, path, offset, limit, config, onList),
  };
};

export default useFiles;
