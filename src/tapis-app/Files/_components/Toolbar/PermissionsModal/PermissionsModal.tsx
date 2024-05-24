import { GenericModal } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { useFilesSelect } from '../../FilesContext';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { FileStat, FileOperation } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Files } from '@tapis/tapis-typescript';
import { Tabs } from '@tapis/tapisui-common';
import styles from './PermissionsModal.module.scss';
import React from 'react';

const PermissionsModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const { selectedFiles } = useFilesSelect();

  const file = selectedFiles[0];
  const { claims } = useTapisConfig();
  const username = claims['tapis/username'];
  const filePath = file.path!;
  const permsRequest: Files.GetPermissionsRequest = {
    systemId: systemId ?? '',
    path: filePath,
    username,
  };

  const { data, isLoading, error } = Hooks.usePermissions(permsRequest);

  const write: boolean =
    data?.result?.permission === Files.FilePermissionPermissionEnum.Modify;

  const tabs: { [name: string]: React.ReactNode } = {
    Info: (
      <FileStat
        systemId={systemId!}
        path={filePath}
        className={styles['list-content']}
      />
    ),
  };

  if (write) {
    tabs['Linux Native Operations'] = (
      <FileOperation systemId={systemId!} path={filePath} />
    );
  }

  const body = (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Tabs tabs={tabs} />
    </QueryWrapper>
  );

  return <GenericModal toggle={toggle} title={`Permissions`} body={body} />;
};

export default PermissionsModal;
