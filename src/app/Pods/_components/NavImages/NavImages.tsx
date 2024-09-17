import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';

const NavImages: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListImages();
  const definitions: Array<Pods.ImageResponseModel> = data?.result ?? [];
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

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
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
  );
};

export default NavImages;
