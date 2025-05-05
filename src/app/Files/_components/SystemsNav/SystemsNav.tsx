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
          groupable={false}
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
          ]}
        >
        </FilterableObjectsList>
      </div>
    </QueryWrapper>
  );
};

export default SystemsNav;
