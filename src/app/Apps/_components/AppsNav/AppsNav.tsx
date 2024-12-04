import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import { FilterableObjectsList, QueryWrapper } from '@tapis/tapisui-common';
import {
  Public,
  Person,
  Apps as AppsIcon,
  LockOpen,
  Lock,
} from '@mui/icons-material';

const AppsNav: React.FC = () => {
  const { data, isLoading, error } = Hooks.useList(
    {
      listType: Apps.ListTypeEnum.All,
      select: 'allAttributes',
      computeTotal: true,
    },
    { refetchOnWindowFocus: false }
  );
  const { url } = useRouteMatch();
  const history = useHistory();
  const apps: Array<Apps.TapisApp> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div
        style={{
          borderBottom: '1px solid #CCCCCC',
          borderRight: '1px solid #CCCCCC',
        }}
      >
        <FilterableObjectsList
          objects={apps}
          defaultField={'isPublic'}
          defaultOnClickItem={(app: any) => {
            history.push(`${url}/${app.id}/${app.version}`);
          }}
          includeAll={true}
          includeAllGroupLabel="All Apps"
          includeAllSelectorLabel="all apps"
          includeAllPrimaryItemText={({ object }: any) => object.id}
          includeAllSecondaryItemText={({ object }: any) =>
            `version: ${object.version}`
          }
          defaultGroupIcon={<AppsIcon />}
          filterable={false}
          groupable={true}
          groups={[
            {
              field: 'isPublic',
              groupSelectorLabel: 'visibility',
              primaryItemText: ({ object }: any) => object.id, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `version: ${object.version}`, // TODO FIXME This 'any' makes me sad. Fix
              open: ['true'],
              tooltip: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) =>
                fieldValue === 'true'
                  ? 'Publically available apps'
                  : 'Apps available only to you and those it was explicitly shared with',
              groupLabel: ({ fieldValue }: any) =>
                fieldValue === 'true' ? 'Public Apps' : 'My Apps',
              groupIcon: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (fieldValue === 'true' ? <Public /> : <Person />),
              groupItemIcon: <AppsIcon />,
            },
            {
              field: 'jobType',
              primaryItemText: ({ object }: any) => object.id,
              secondaryItemText: ({ object }: any) =>
                `version: ${object.version}`,
              groupSelectorLabel: 'job type',
              groupLabel: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => fieldValue,
              groupIcon: <AppsIcon />,
              groupItemIcon: <AppsIcon />,
              tooltip: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => fieldValue,
              onClickItem: (object: any) => {
                history.push(`${url}/${object.id}/${object.version}`);
              },
            },
            {
              field: 'owner',
              primaryItemText: ({ object }: any) => object.id,
              secondaryItemText: ({ object }: any) =>
                `version: ${object.version}`,
              groupSelectorLabel: 'owner',
              groupLabel: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => fieldValue,
              groupIcon: <Person />,
              groupItemIcon: <AppsIcon />,
              tooltip: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => fieldValue,
              onClickItem: (object: any) => {
                history.push(`${url}/${object.id}/${object.version}`);
              },
            },
            {
              field: 'enabled',
              primaryItemText: ({ object }: any) => object.id,
              secondaryItemText: ({ object }: any) =>
                `version: ${object.version}`,
              groupSelectorLabel: 'enabled',
              groupLabel: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (fieldValue === 'true' ? 'Enabled Apps' : 'Disabled Apps'),
              groupIcon: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) =>
                fieldValue === 'true' ? (
                  <LockOpen color="success" />
                ) : (
                  <Lock color="error" />
                ),
              tooltip: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) =>
                fieldValue === 'true'
                  ? 'enabled'
                  : 'Disabled - disabled applications cannot be run',
              onClickItem: (object: any) => {
                history.push(`${url}/${object.id}/${object.version}`);
              },
            },
          ]}
        />
      </div>
    </QueryWrapper>
  );
};

export default AppsNav;
