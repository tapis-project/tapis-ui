import { useState } from 'react';
import { GenericModal } from 'tapis-ui/_common';
import { ToolbarModalProps } from '../Toolbar';
import { useFilesSelect } from '../../FilesContext';
import { usePermissions } from 'tapis-hooks/files';
import { FileStat, FileOperation } from 'tapis-ui/components/files';
import { useTapisConfig } from 'tapis-hooks';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Files } from '@tapis/tapis-typescript';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import styles from './PermissionsModal.module.scss';

const PermissionsModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const { selectedFiles } = useFilesSelect();
  const [activeTab, setActiveTab] = useState('stat');
  const file = selectedFiles[0];
  const { claims } = useTapisConfig();
  const username = claims['tapis/username'];
  const filePath = file.path!;
  const permsRequest: Files.GetPermissionsRequest = {
    systemId: systemId ?? '',
    path: filePath,
    username,
  };

  const { data, isLoading, error } = usePermissions(permsRequest);

  const write: boolean =
    data?.result?.permission === Files.FilePermissionPermissionEnum.Modify;

  const getTabClassname = (tabName: string) => {
    return `${styles.tab} ${activeTab === tabName ? styles.active : ''}`;
  };

  const body = (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Nav tabs>
        <NavItem className={getTabClassname('stat')}>
          <NavLink onClick={() => setActiveTab('stat')} data-testid="stat-tab">
            Info
          </NavLink>
        </NavItem>
        {write && (
          <NavItem className={getTabClassname('nativeop')}>
            <NavLink
              onClick={() => setActiveTab('nativeop')}
              data-testid="nativeop-tab"
            >
              Linux Native Operations
            </NavLink>
          </NavItem>
        )}
      </Nav>
      <TabContent activeTab={activeTab} className={styles['tab-content']}>
        <TabPane tabId="stat">
          <FileStat
            systemId={systemId!}
            path={filePath}
            className={styles['list-content']}
          />
        </TabPane>
        {write && (
          <TabPane tabId="nativeop">
            <FileOperation systemId={systemId!} path={filePath} />
          </TabPane>
        )}
      </TabContent>
    </QueryWrapper>
  );

  return <GenericModal toggle={toggle} title={`Permissions`} body={body} />;
};

export default PermissionsModal;
