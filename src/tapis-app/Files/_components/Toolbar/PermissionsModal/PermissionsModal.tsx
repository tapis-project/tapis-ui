import { useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useForm } from 'react-hook-form';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import { useFilesSelect } from '../../FilesContext';
import { usePermissions } from 'tapis-hooks/files';
import { FileStat } from 'tapis-ui/components/files';
import { useTapisConfig } from 'tapis-hooks';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Files } from '@tapis/tapis-typescript';

const PermissionsModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const { selectedFiles } = useFilesSelect();

  const file = selectedFiles[0];

  const { claims } = useTapisConfig();
  const username = claims["tapis/username"];
  const filePath = file.path!;
  const permsRequest: Files.GetPermissionsRequest = {
    systemId: systemId ?? '',
    path: filePath,
    username
  }
  const { data, isLoading, error} = usePermissions(permsRequest)
  const write: boolean = data?.result?.permission === Files.FilePermissionPermissionEnum.Modify;

  const body = (
    <QueryWrapper isLoading={isLoading} error={error}>
      <FileStat systemId={systemId!} path={filePath} write={write} />
    </QueryWrapper>
  )


  return (
    <GenericModal
      toggle={toggle}
      title={`Permissions`}
      body={body}
      footer={<div></div>}
    />
  );
};

export default PermissionsModal;
