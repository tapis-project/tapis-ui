import React from 'react';
import { useList } from 'tapis-hooks/workflows/groups';
import { Workflows } from '@tapis/tapis-typescript';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';

type GroupsNavProps = {
  baseUrl: string;
};

const GroupsNav: React.FC<GroupsNavProps> = ({ baseUrl }) => {
  const { data, isLoading, error } = useList();
  const result: Array<Workflows.Group> = data?.result ?? [];
  const groups = result.sort((a, b) =>
    (a.id! > b.id!) ? 1 : (a.id! < b.id! ? -1 : 0))

  return (
    <div>
      <QueryWrapper isLoading={isLoading} error={error}>
        <Navbar>
          {groups.length ? (
            groups.map((group) => (
              <NavItem to={`${baseUrl}/${group.id}`} icon="user" key={group.id}>
                {group.id}
              </NavItem>
            ))
          ) : (
            <i>
              No groups found.
              <br />
              <br />
              Create a new group or request access to an existing group from a
              group admin.
            </i>
          )}
        </Navbar>
      </QueryWrapper>
    </div>
  );
};

export default GroupsNav;
