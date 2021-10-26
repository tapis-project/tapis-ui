import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/streams/instruments';
import { Streams } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const InstrumentsNav: React.FC<{ projectId: string, siteId: string }> = ({
  projectId,
  siteId
}) => {
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = useList({
    projectId,
    siteId
  });
  const definitions: Array<Streams.Instrument> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((instrument) => (
            <NavItem
              to={`${url}/${instrument.inst_name}`}
              icon="instruments"
              key={instrument.inst_name}
            >
              {`${instrument.inst_name}`}
            </NavItem>
          ))
        ) : (
          <i>No instruments found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default InstrumentsNav;
