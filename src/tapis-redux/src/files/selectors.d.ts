import { TapisState } from '../store/rootReducer';
import { FileListingDirectory } from './types';
declare type getListingSelectorType = (state: TapisState) => FileListingDirectory;
declare const getListing: (systemId: string, path: string) => getListingSelectorType;
export default getListing;
