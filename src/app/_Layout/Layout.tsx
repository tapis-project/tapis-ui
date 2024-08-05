import React, { useState } from 'react';
import { Router } from 'app/_Router';
import { NotificationsProvider } from 'app/_components/Notifications';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import './Layout.scss';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {
  QueryWrapper,
  PageLayout,
  Breadcrumbs,
  breadcrumbsFromPathname,
} from '@tapis/tapisui-common';
import { Sidebar } from 'app/_components';

const Layout: React.FC = () => {
  const { claims } = useTapisConfig();
  const { extension } = useExtension();
  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFromPathname(pathname);

  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const header = (
    <div className="tapis-ui__header">
      <div style={{ marginLeft: '1.2rem' }}>
        <Breadcrumbs breadcrumbs={crumbs} />
      </div>
      <div>{false && <ButtonDropdown size="sm" />}</div>
    </div>
  );

  return (
    <NotificationsProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        <PageLayout
          left={<Sidebar />}
          right={
            <div style={{ height: '100vh' }}>
              <div>{crumbs && crumbs.length == 0 ? null : header}</div>
              <div className="body">
                <Router />
              </div>
            </div>
          }
        />
      </div>
    </NotificationsProvider>
  );
};

export default Layout;
