import React, { useState } from 'react';
import { Sidebar } from 'tapis-app/_components';
import { Router } from 'tapis-app/_Router';
import { PageLayout } from 'tapis-ui/_common';
import { NotificationsProvider } from 'tapis-app/_components/Notifications';
import { useHistory } from 'react-router-dom';
import { useList } from 'tapis-hooks/tenants';
import './Layout.scss';
import { useTapisConfig } from 'tapis-hooks';
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const Layout: React.FC = () => {
  const { claims } = useTapisConfig();
  const { data, isLoading, error } = useList();
  const result = data?.result ?? [];
  const tenants = result;
  // const tenants = result.sort((a, b) =>
  //   a.tenant_id! > b.tenant_id! ? 1 : a.tenant_id! < b.tenant_id! ? -1 : 0
  // );
  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const header = (
    <div className="tapis-ui__header">
      <div>TapisUI</div>
      <div></div>
      <div>
        {claims['sub'] && (
          <ButtonDropdown
            size="sm"
            isOpen={isOpen}
            toggle={() => setIsOpen(!isOpen)}
            className="dropdown-button"
          >
            <DropdownToggle caret>{claims['sub']}</DropdownToggle>
            <DropdownMenu style={{ maxHeight: '50vh', overflowY: 'scroll' }}>
              <DropdownItem header>Tenants</DropdownItem>
              <DropdownItem divider />
              <QueryWrapper isLoading={isLoading} error={error}>
                {tenants.map((tenant) => {
                  return (
                    <DropdownItem
                      onClick={() => {
                        window.location.href = tenant.base_url + '/tapis-ui/';
                      }}
                    >
                      {tenant.tenant_id}
                    </DropdownItem>
                  );
                })}
              </QueryWrapper>
              <DropdownItem divider />
              <DropdownItem onClick={() => history.push('/logout')}>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        )}
      </div>
    </div>
  );

  const workbenchContent = (
    <div className="workbench-content">
      <Router />
    </div>
  );

  return (
    <NotificationsProvider>
      <div style={{ display: 'flex', flexGrow: 1, height: '100vh' }}>
        <PageLayout top={header} left={<Sidebar />} right={workbenchContent} />
      </div>
    </NotificationsProvider>
  );
};

export default Layout;
