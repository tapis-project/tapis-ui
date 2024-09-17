import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import { Navbar, NavItem, QueryWrapper } from '@tapis/tapisui-common';

const AppsNav: React.FC = () => {
  const { data, isLoading, error } = Hooks.useList(
    {},
    { refetchOnWindowFocus: false }
  );
  const { url } = useRouteMatch();
  const appList: Array<Apps.TapisApp> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {appList.length ? (
          appList.map((app) => (
            <NavItem
              to={`${url}/${app.id}/${app.version}`}
              icon="applications"
              key={app.id}
            >
              {`${app.id} v${app.version}`}
            </NavItem>
          ))
        ) : (
          <i style={{ padding: '16px' }}>No apps found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default AppsNav;
