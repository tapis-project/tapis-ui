import { Files } from '@tapis/tapis-typescript';

export type FilesContextType = {
  selectedFiles: Array<Files.FileInfo>;
  setSelectedFiles: (selectedFiles: Array<Files.FileInfo>) => void;
};

export { default as FilesContext } from './FilesContext';
export { default as FilesProvider } from './FilesProvider';
export { default as useFilesSelect } from './useFilesSelect';
