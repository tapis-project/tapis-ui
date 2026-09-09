import React, { useContext } from 'react';
import FileSelectModal from './FileSelectModal';
import type { FileSelectModalProps } from './types';

/**
 * Which modal a Browse press opens.
 *
 * Every picker in this package asks here rather than importing
 * FileSelectModal, so an app can hand one part of itself a different modal
 * (the guided launcher's V2) while every other page keeps this one. Unset,
 * it is FileSelectModal, looked up at render so the import cycle through
 * the files index can never leave it undefined.
 */
const FileSelectModalContext =
  React.createContext<React.ComponentType<FileSelectModalProps> | null>(null);

export const FileSelectModalProvider = FileSelectModalContext.Provider;

export const useFileSelectModal =
  (): React.ComponentType<FileSelectModalProps> =>
    useContext(FileSelectModalContext) ?? FileSelectModal;
