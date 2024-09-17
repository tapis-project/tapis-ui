import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import PodsLoadingText from '../PodsLoadingText';

const NavTemplates: React.FC = () => {
  const { url } = useRouteMatch();
  const { data, isLoading, error } = Hooks.useListTemplates();
  const definitions: Array<Pods.TemplateResponseModel> = data?.result ?? [];
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
          .sort((a, b) => a.template_id.localeCompare(b.template_id)) //sort by `template_id` property
          .map((templates) => (
            <NavItem
              to={`/pods/templates/${templates.template_id}`}
              icon="globe"
              key={templates.template_id}
            >
              {`${templates.template_id}`}
            </NavItem>
          ))
      ) : (
        <i style={{ padding: '16px' }}>No templates found</i>
      )}
    </Navbar>
  );
};

export default NavTemplates;
