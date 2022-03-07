import { useContext } from 'react';
import { useCallback } from 'react';
import FilesContext from './FilesContext';
import { Files } from '@tapis/tapis-typescript';

const useFilesSelect = () => {
  const { selectedFiles, setSelectedFiles } = useContext(FilesContext);

  const select = useCallback(
    (files: Array<Files.FileInfo>, mode: 'single' | 'multi') => {
      if (mode === 'single' && files.length === 1) {
        setSelectedFiles(files);
      }

      if (mode === 'multi') {
        const selectedSet = new Set(selectedFiles.map((file) => file.path));
        const newSelection = [
          ...selectedFiles,
          ...files.filter((file) => !selectedSet.has(file.path)),
        ];
        setSelectedFiles(newSelection);
      }
    },
    [selectedFiles, setSelectedFiles]
  );

  const unselect = useCallback(
    (files: Array<Files.FileInfo>) => {
      const selectedSet = new Set(
        selectedFiles.map((selected) => selected.path)
      );
      files.forEach((file) => selectedSet.delete(file.path ?? ''));
      const newSelection = selectedFiles.filter((selected) =>
        selectedSet.has(selected.path)
      );
      setSelectedFiles(newSelection);
    },
    [selectedFiles, setSelectedFiles]
  );

  const clear = useCallback(() => {
    setSelectedFiles([]);
  }, [setSelectedFiles]);

  return {
    selectedFiles,
    select,
    unselect,
    clear,
  };
};

export default useFilesSelect;
