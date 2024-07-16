import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const NavVolumes: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListVolumes();
  const definitions: Array<Pods.VolumeResponseModel> = data?.result ?? [];

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions
            .sort((a, b) => a.volume_id.localeCompare(b.volume_id)) //sort by `volume_id` property
            .map((volume) => (
              <NavItem
                to={`/pods/volumes/${volume.volume_id}`}
                icon="folder"
                key={volume.volume_id}
              >
                {`${volume.volume_id}`}
              </NavItem>
            ))
        ) : (
          <i style={{ padding: '16px' }}>No volumes found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default NavVolumes;
