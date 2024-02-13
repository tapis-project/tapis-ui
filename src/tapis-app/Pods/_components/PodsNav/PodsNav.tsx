import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/pods';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const PodsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = useList();
  const definitions: Array<Pods.PodResponseModel> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((pod) => (
            <NavItem
              to={`${url}/${pod.pod_id}`}
              icon="visualization"
              key={pod.pod_id}
            >
              {`${pod.pod_id}`} 
            </NavItem>
          ))
        ) : (
          <i>No pods found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default PodsNav;
