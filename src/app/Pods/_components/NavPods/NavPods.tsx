import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';

const NavPods: React.FC = () => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = Hooks.useListPods();
  const definitions: Array<Pods.PodResponseModel> = data?.result ?? [];
  const loadingText = PodsLoadingText();

  if (isLoading) {
    return (
      <Navbar>
        <div style={{ paddingLeft: '16px' }}>
          <NavItem icon="visualization">{loadingText}</NavItem>
        </div>
      </Navbar>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Navbar>
      {definitions.length ? (
        definitions
          .sort((a, b) => a.pod_id.localeCompare(b.pod_id))
          .map((pod) => (
            <NavItem
              to={`/pods/${pod.pod_id}`}
              icon="visualization"
              key={pod.pod_id}
            >
              {`${pod.pod_id}`}
            </NavItem>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No pods found</i>
      )}
    </Navbar>
  );
};

export default NavPods;
