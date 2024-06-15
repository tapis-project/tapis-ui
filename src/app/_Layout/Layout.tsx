import React, { useState } from 'react';
import { Router } from 'app/_Router';
import { NotificationsProvider } from 'app/_components/Notifications';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Tenants as Hooks } from '@tapis/tapisui-hooks';
import './Layout.scss';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from "extensions"
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
  const { extension } = useExtension()
  const { data, isLoading, error } = Hooks.useList();
  const result = data?.result ?? [];
  const tenants = result;
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFromPathname(pathname);
  
  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const header = (
    <div className="tapis-ui__header">
      <div>
        <Link to={"/"}>
        {
          extension?.logo?.url
          ? <img style={{height: "30px"}} className="logo" src={extension?.logo.url} />
          : <img style={{height: "30px"}} className="logo" src="./tapislogo.png" />
        }
        </Link>
        {extension?.logo?.logoText || "TapisUI"}
      </div>
      <div><Breadcrumbs breadcrumbs={crumbs} /></div>
      <div>
        {
          claims['sub'] && (
            <ButtonDropdown
              size="sm"
              isOpen={isOpen}
              toggle={() => setIsOpen(!isOpen)}
              className="dropdown-button"
            >
              <DropdownToggle caret>{claims['sub']}</DropdownToggle>
              <DropdownMenu style={{ maxHeight: '50vh', overflowY: 'scroll' }}>
                {
                  (extension !== undefined && extension.allowMutiTenant) &&
                  <>
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
                  </>
                }
                <DropdownItem onClick={() => history.push('/logout')}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          )
        }
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
        <PageLayout
          top={header}
          left={<Sidebar />}
          right={workbenchContent}
        />
      </div>
    </NotificationsProvider>
  );
};

export default Layout;
