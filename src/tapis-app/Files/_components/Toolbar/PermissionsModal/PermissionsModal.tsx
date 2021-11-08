import { useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useForm } from 'react-hook-form';
import { useStat, usePermissions } from 'tapis-hooks/files';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import { useFilesSelect } from '../../FilesContext';
import { FileStat } from 'tapis-ui/components/files';
import { Files } from '@tapis/tapis-typescript';

const PermissionsModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const { selectedFiles } = useFilesSelect();

  const file = selectedFiles[0];

  return (
    <GenericModal
      toggle={toggle}
      title={`Permissions`}
      body={<FileStat systemId={systemId!} path={file.path!} />}
      footer={<div></div>}
    />
  );
};

export default PermissionsModal;
