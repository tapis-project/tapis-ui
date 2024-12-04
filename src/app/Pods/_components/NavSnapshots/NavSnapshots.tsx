import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';

const NavSnapshots: React.FC = () => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = Hooks.useListSnapshots();
  const definitions: Array<Pods.SnapshotResponseModel> = data?.result ?? [];
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
          .sort((a, b) => a.snapshot_id.localeCompare(b.snapshot_id)) //sort by `snapshot_id` property
          .map((snapshot) => (
            <NavItem
              to={`/pods/snapshots/${snapshot.snapshot_id}`}
              icon="folder"
              key={snapshot.snapshot_id}
            >
              {`${snapshot.snapshot_id}`}
            </NavItem>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No snapshots found</i>
      )}
    </Navbar>
  );
};

export default NavSnapshots;
