import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const NavImages: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListImages();
  const definitions: Array<Pods.ImageResponseModel> = data?.result ?? [];

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions
            .sort((a, b) => a.image.localeCompare(b.image)) //sort by `image` property
            .map((image) => (
              <NavItem
                to={`/pods/images/${image.image}`}
                icon="image"
                key={image.image}
              >
                {`${image.image}`}
              </NavItem>
            ))
        ) : (
          <i style={{ padding: '16px' }}>No images found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default NavImages;
