import React from 'react';
import { FileViewerPanel } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { useFilesSelect } from '../../FilesContext';

/**
 * The rail's View button, on the same panel the listing's own eye opens.
 *
 * It used to be an xl bootstrap modal that blacked out the app around a
 * 500px iframe with an empty title bar. Now the two ways into the viewer land
 * in the same place — a resizable side panel that says what it is showing and
 * leaves the directory beside it readable.
 *
 * The name is kept because the mechanism is: a PostIt (one use, one minute)
 * is minted for the file and its redeem URL is what gets loaded.
 */
const CreatePostitModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
}) => {
  const { selectedFiles, unselect } = useFilesSelect();
  const file = selectedFiles[0];
  if (!file) return null;

  return (
    <FileViewerPanel
      systemId={systemId}
      file={file}
      onClose={() => {
        toggle();
        unselect(selectedFiles);
      }}
    />
  );
};

export default CreatePostitModal;
