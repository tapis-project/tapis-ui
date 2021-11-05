import React from 'react';
import { FilesContextType } from '.';

export const filesContext: FilesContextType = {
  selectedFiles: [],
  setSelectedFiles: () => {},
};

const FilesContext: React.Context<FilesContextType> =
  React.createContext<FilesContextType>(filesContext);

export default FilesContext;
