import React, { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { QueryWrapper, FilterableObjectsList } from '@tapis/tapisui-common';
import {
  Dns,
  Public,
  Person,
  Delete,
  Restore,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import { Alert, AlertTitle } from '@mui/material';
import UndeleteSystemModal from '../SystemToolbar/UndeleteSystemModal';
import styles from './SystemsNav.module.scss';

const SystemsNav: React.FC = () => {
  const [undeleteSystem, setUndeleteSystem] = useState<string | undefined>(
    undefined
  );

  const { url } = useRouteMatch();
  const history = useHistory();

  // Fetch systems listing
  const { data, isLoading, error } = Hooks.useList({
    listType: Systems.ListTypeEnum.All,
    select: 'allAttributes',
    computeTotal: true,
    limit: 1000,
  });

  // Fetch deleted systems listing
  const {
    data: deletedData,
    isLoading: deletedIsLoading,
    error: deletedError,
  } = Hooks.useDeletedList();
  const deletedSystems: Array<Systems.TapisSystem> = deletedData?.result ?? [];
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={[error]}>
      <div
        style={{
          borderBottom: '1px solid #CCCCCC',
          borderRight: '1px solid #CCCCCC',
        }}
        className={styles['scroll-container']}
      >
        <FilterableObjectsList
          objects={systems}
          defaultField={'isPublic'}
          defaultOnClickItem={(system: any) => {
            history.push(`${url}/${system.id!}`);
          }}
          includeAll={true}
          includeAllGroupLabel="All Systems"
          includeAllSelectorLabel="all systems"
          includeAllPrimaryItemText={({ object }: any) => object.id}
          includeAllSecondaryItemText={({ object }: any) => object.host}
          defaultGroupIcon={<Dns />}
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
              groupItemIcon: <Dns />,
            },
            {
              field: 'host',
              primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
              groupIcon: <Dns />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'systemType',
              groupSelectorLabel: 'type',
              primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
              groupIcon: <Dns />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'defaultAuthnMethod',
              primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) => object.host, // TODO FIXME This 'any' makes me sad. Fix
              groupSelectorLabel: 'auth',
              groupIcon: <Dns />,
              groupItemIcon: <Dns />,
            },
            {
              field: 'enabled',
              primaryItemText: ({ object }) => object.id,
              secondaryItemText: ({ object }) => object.host,
              groupSelectorLabel: 'enabled',
              groupLabel: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) =>
                fieldValue === 'true' ? 'Enabled Systems' : 'Disabled Systems',
              groupIcon: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) =>
                fieldValue === 'true' ? (
                  <LockOpen color="success" />
                ) : (
                  <Lock color="error" />
                ),
            },
          ]}
        >
          <QueryWrapper isLoading={deletedIsLoading} error={[deletedError]}>
            <FilterableObjectsList
              objects={deletedSystems}
              defaultField={undefined}
              includeAll={true}
              includeAllOpen={false}
              includeAllShowDropdown={true}
              includeAllGroupLabel="Deleted Systems"
              includeAllToolTip="Systems that have been soft deleted"
              includeAllGroupIcon={() => <Delete color="error" />}
              includeAllGroupItemIcon={() => <Restore color="success" />}
              includeAllPrimaryItemText={({ object }: any) => object.id}
              includeAllSecondaryItemText={({ object }: any) => object.host}
              defaultOnClickItem={(object: any) => {
                setUndeleteSystem(object.id);
              }}
              filterable={false}
              groupable={false}
              orderable={false}
              defaultGroupIcon={<Delete color="error" />}
              defaultGroupItemIcon={<Restore color="success" />}
              groups={[]}
            />
          </QueryWrapper>
        </FilterableObjectsList>
      </div>
      {undeleteSystem && (
        <UndeleteSystemModal
          systemId={undeleteSystem}
          toggle={() => {
            setUndeleteSystem(undefined);
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default SystemsNav;
