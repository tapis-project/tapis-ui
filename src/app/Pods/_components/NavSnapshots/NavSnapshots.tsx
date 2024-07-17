import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const NavSnapshots: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListSnapshots();
  const definitions: Array<Pods.SnapshotResponseModel> = data?.result ?? [];

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions
            .sort((a, b) => a.snapshot_id.localeCompare(b.snapshot_id)) //sort by `snapshot_id` property
            .map((snapshot) => (
              <NavItem
                to={`/pods/snapshot/${snapshot.snapshot_id}`}
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
    </QueryWrapper>
  );
};

export default NavSnapshots;
