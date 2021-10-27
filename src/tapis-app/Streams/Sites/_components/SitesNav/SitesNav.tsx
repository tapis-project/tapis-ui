import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/streams/sites';
import { Streams } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const SitesNav: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = useList({
    projectId,
  });
  const definitions: Array<Streams.Site> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((site) => (
            <NavItem
              to={`${url}/${site.site_name}`}
              icon="sites"
              key={site.site_name}
            >
              {`${site.site_name}`}
            </NavItem>
          ))
        ) : (
          <i>No sites found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default SitesNav;
