import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import {
  QueryWrapper,
  FilterableObjectsList,
  JobStatusIcon,
} from '@tapis/tapisui-common';
import { Work, Dns, Apps } from '@mui/icons-material';

// UTC: Year Month Day HH:MM:SS
const formatUTCDate = (value?: string | number | Date) => {
  if (!value) return '';
  const d = new Date(value);
  const yyyy = d.getUTCFullYear();
  const MM = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const HH = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
};

const JobsNav: React.FC = () => {
  const history = useHistory();
  const { data, isLoading, error } = Hooks.useList({
    computeTotal: true,
    limit: 300,
    orderBy: 'lastUpdated(DESC)',
  });
  const { url } = useRouteMatch();
  const jobs: Array<Jobs.JobListDTO> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div
        style={{
          height: 'calc(100vh - 105px)', // Make the nav take full viewport height - shouldn't be calculated, but haven't figured out perfect solution for entire app yet
          minWidth: '100%',
          overflowY: 'auto', // Enable vertical scrolling only for this div
        }}
      >
        <FilterableObjectsList
          objects={jobs}
          defaultField={'*'}
          defaultOnClickItem={(job: any) => {
            history.push(`${url}/${job.uuid}`);
          }}
          includeAll={true}
          includeAllGroupLabel="All Jobs"
          includeAllSelectorLabel="all jobs"
          includeAllPrimaryItemText={({ object }: any) => object.name}
          includeAllSecondaryItemText={({ object }: any) =>
            `${object.appId}${object.appVersion}`
          }
          includeAllTertiaryItemText={({ object }: any) =>
            `${formatUTCDate(object.created)}`
          }
          includeAllGroupItemIcon={({ object }: any) => (
            <JobStatusIcon
              status={object.status}
              animation={
                object.status === Jobs.JobListDTOStatusEnum.Running
                  ? 'rotate'
                  : undefined
              }
            />
          )}
          defaultGroupIcon={<Work />}
          orderGroupsBy="DESC"
          filterable={false}
          groupable={true}
          groups={[
            {
              field: 'status',
              groupSelectorLabel: 'status',
              primaryItemText: ({ object }: any) => object.name, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `${object.appId}${object.appVersion}`, // TODO FIXME This 'any' makes me sad. Fix
              tertiaryItemText: ({ object }: any) =>
                `${formatUTCDate(object.created)}`,
              open: [],
              tooltip: ({ fieldValue }: any) => fieldValue, // TODO FIXME This 'any' makes me sad. Fix
              onClickItem: (object: any) => {
                history.push(`${url}/${object.uuid}`);
              },
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={fieldValue}
                  animation={
                    fieldValue === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
              groupItemIcon: (
                { fieldValue }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={fieldValue}
                  animation={
                    fieldValue === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
            },
            {
              field: 'execSystemId',
              groupSelectorLabel: 'execution system',
              primaryItemText: ({ object }: any) => object.name, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `${object.appId}:${object.appVersion}`, // TODO FIXME This 'any' makes me sad. Fix
              tertiaryItemText: ({ object }: any) =>
                `${formatUTCDate(object.created)}`,
              open: [],
              tooltip: ({ fieldValue }: any) => fieldValue, // TODO FIXME This 'any' makes me sad. Fix
              onClickItem: (object: any) => {
                history.push(`${url}/${object.uuid}`);
              },
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: <Dns />,
              groupItemIcon: (
                { object }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={object.status}
                  animation={
                    object.status === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
            },
            {
              field: 'archiveSystemId',
              groupSelectorLabel: 'archive system',
              primaryItemText: ({ object }: any) => object.name, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `${object.appId}:${object.appVersion}`, // TODO FIXME This 'any' makes me sad. Fix
              tertiaryItemText: ({ object }: any) =>
                `${formatUTCDate(object.created)}`,
              open: [],
              tooltip: ({ fieldValue }: any) => fieldValue, // TODO FIXME This 'any' makes me sad. Fix
              onClickItem: (object: any) => {
                history.push(`${url}/${object.uuid}`);
              },
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: <Dns />,
              groupItemIcon: (
                { object }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={object.status}
                  animation={
                    object.status === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
            },
            {
              field: 'appId',
              groupSelectorLabel: 'app',
              primaryItemText: ({ object }: any) => object.name, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `${object.appId}:${object.appVersion}`, // TODO FIXME This 'any' makes me sad. Fix
              tertiaryItemText: ({ object }: any) =>
                `${formatUTCDate(object.created)}`,
              open: [],
              tooltip: ({ fieldValue }: any) => fieldValue, // TODO FIXME This 'any' makes me sad. Fix
              onClickItem: (object: any) => {
                history.push(`${url}/${object.uuid}`);
              },
              groupLabel: ({ fieldValue }: any) => fieldValue,
              groupIcon: <Apps />,
              groupItemIcon: (
                { object }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={object.status}
                  animation={
                    object.status === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
            },
            {
              field: 'lastUpdated',
              groupSelectorLabel: 'last updated',
              primaryItemText: ({ object }: any) => object.name, // TODO FIXME This 'any' makes me sad. Fix
              secondaryItemText: ({ object }: any) =>
                `${object.appId}:${object.appVersion}`, // TODO FIXME This 'any' makes me sad. Fix
              tertiaryItemText: ({ object }: any) =>
                `${formatUTCDate(object.lastUpdated)}`,
              open: ['*'],
              tooltip: ({ fieldValue }: any) => fieldValue, // TODO FIXME This 'any' makes me sad. Fix
              onClickItem: (object: any) => {
                history.push(`${url}/${object.uuid}`);
              },
              showDropdown: false,
              groupLabel: () => '',
              groupIcon: () => '',
              groupItemIcon: (
                { object }: any // TODO FIXME This 'any' makes me sad. Fix
              ) => (
                <JobStatusIcon
                  status={object.status}
                  animation={
                    object.status === Jobs.JobListDTOStatusEnum.Running
                      ? 'rotate'
                      : undefined
                  }
                />
              ),
            },
          ]}
        />
      </div>
    </QueryWrapper>
  );
};

export default JobsNav;
