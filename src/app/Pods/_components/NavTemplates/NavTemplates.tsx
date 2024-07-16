import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const NavTemplates: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = Hooks.useListTemplates();
  const definitions: Array<Pods.TemplateResponseModel> = data?.result ?? [];

  // Display returns upper case first letter, lower case rest for the pod.status
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
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
    </QueryWrapper>
  );
};

export default NavTemplates;
