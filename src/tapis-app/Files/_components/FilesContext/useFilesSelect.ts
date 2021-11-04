import { useContext } from 'react';
import { useQuery } from 'react-query';
import React, { useCallback } from 'react';
import FilesContext from './FilesContext';
import { Files } from '@tapis/tapis-typescript';

const useFilesSelect = () => {
  const { selectedFiles, setSelectedFiles } = useContext(FilesContext);

  const select = useCallback(
    (files: Array<Files.FileInfo>) => {
      setSelectedFiles(files);
    },
    [ selectedFiles, setSelectedFiles ]
  )

  const clearSelection = useCallback(
    () => {
      setSelectedFiles([]);
    },
    [ setSelectedFiles ]
  )

  return {
    selectedFiles,
    select,
    clearSelection
  };
};

export default useFilesSelect;
