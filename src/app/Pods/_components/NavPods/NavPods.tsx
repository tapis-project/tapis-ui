import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const NavPods: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useList();
  const definitions: Array<Pods.PodResponseModel> = data?.result ?? [];

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions
            .sort((a, b) => a.pod_id.localeCompare(b.pod_id)) //sort by `pod_id` property
            .map((pod) => (
              <NavItem
                to={`/pods/${pod.pod_id}`}
                icon="visualization"
                key={pod.pod_id}
              >
                {`${pod.pod_id}`}
                {/* {`${pod.pod_id} - ${pod.status?.charAt(0)}${pod.status
                ?.slice(1)
                .toLowerCase()}`} */}
              </NavItem>
            ))
        ) : (
          <i style={{ padding: '16px' }}>No pods found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default NavPods;
