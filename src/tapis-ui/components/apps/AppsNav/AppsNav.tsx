import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/apps';
import { Apps } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/components/Navbar';
import QueryWrapper from 'tapis-ui/components/QueryWrapper';

const AppsNav: React.FC = () => {
  const { data, isLoading, error } = useList();
  const { url } = useRouteMatch();
  const appList: Array<Apps.TapisApp> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {
          appList.map(
            (app: Apps.TapisApp ) => (
              <NavItem
                to={`${url}/${app.id}/${app.version}`}
                icon="applications"
                key={app.id}
              >
                {`${app.id} v${app.version}`}
              </NavItem>
            )
          )
        }
      </Navbar>
    </QueryWrapper>
  )
};

export default AppsNav;
