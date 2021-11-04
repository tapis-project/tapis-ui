import React, { useState } from 'react';
import { Files } from '@tapis/tapis-typescript';
import { FilesContextType } from '.';
import FilesContext from './FilesContext';

const FilesProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<Files.FileInfo>>([]);

  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: FilesContextType = {
    selectedFiles,
    setSelectedFiles,
  };

  return (
    <FilesContext.Provider value={contextValue}>
      {children}
    </FilesContext.Provider>
  );
};

export default FilesProvider;
