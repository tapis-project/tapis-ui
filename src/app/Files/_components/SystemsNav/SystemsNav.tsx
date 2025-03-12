import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { FilterableObjectsList, Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Folder, Person, Public } from '@mui/icons-material';

const SystemsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = Hooks.useList();
  const definitions: Array<Systems.TapisSystem> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <FilterableObjectsList
      objects={definitions}
      defaultField={'isPublic'}
      includeAll={true}
      includeAllGroupLabel="All Systems"
      includeAllSelectorLabel="all systems"
      includeAllPrimaryItemText={({ object }: any) => object.id}
      includeAllSecondaryItemText={({ object }: any) => object.host}
      defaultGroupIcon={<Folder />}
      filterable={false}
      groupable={true}
        groups={[
                 {
                   field: 'isPublic',
                   groupSelectorLabel: 'visibility',
                   primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
                   secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
                   open: ['true'],
                   tooltip: (
                     { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
                   ) =>
                     fieldValue === 'true'
                       ? 'Publically available systems'
                       : 'Systems available only to you and those it was explicitly shared with',
                   groupLabel: ({ fieldValue }: any) =>
                     fieldValue === 'true' ? 'Public Systems' : 'My Systems',
                   groupIcon: (
                     { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
                   ) => (fieldValue === 'true' ? <Public /> : <Person />),
                   groupItemIcon: <Folder />,
                 },
                 {
                   field: 'host',
                   primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
                   secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
                   groupIcon: <Folder />,
                   groupItemIcon: <Folder />,
                 },
                 {
                   field: 'systemType',
                   groupSelectorLabel: 'type',
                   primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
                   secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
                   groupIcon: <Folder />,
                   groupItemIcon: <Folder />,
                 },
                 {
                   field: 'defaultAuthnMethod',
                   primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
                   secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
                   groupSelectorLabel: 'auth',
                   groupIcon: <Folder />,
                   groupItemIcon: <Folder />,
                 },
               ]} 
               >

      </FilterableObjectsList>
    </QueryWrapper>
  );
};

export default SystemsNav;

        // <Navbar>
        //   {definitions.length ? (
        //     definitions.map((system) => (
        //       <NavItem to={`${url}/${system.id}`} icon="folder" key={system.id}>
        //         {`${system.id}`}
        //       </NavItem>
        //     ))
        //   ) : (
        //     <i style={{ padding: '16px' }}>No systems found</i>
        //   )}
        // </Navbar>