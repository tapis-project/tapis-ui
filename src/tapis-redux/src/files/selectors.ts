import { TapisState } from '../store/rootReducer';
import { useSelector } from 'react-redux';
import { FileListingDirectory } from './types';

// A selector generator that returns a selector for a given path listing
// ex:
// const listing: FileListingDirectory = useSelector(getListing('MySystemId', '/path'));
type getListingSelectorType = (state: TapisState) => FileListingDirectory;

const getListing = (systemId: string, path: string) => {
  return (state: TapisState): FileListingDirectory | undefined => {
    if (systemId in state.files.listings && path in state.files.listings[systemId]) {
      return state.files.listings[systemId][path];
    }
    return undefined;
  }
}

export default getListing;
