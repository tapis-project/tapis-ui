import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import {
  QueryWrapper,
  FilterableObjectsList,
  JobStatusIcon,
  FilterConfig,
} from '@tapis/tapisui-common';
import { Work, Dns, Apps, AccessTime } from '@mui/icons-material';

// Job filter configuration
const jobFilterConfig: FilterConfig = {
  filterableFields: [
    {
      field: 'created',
      label: 'created',
      filterType: 'timeRange',
      presets: [
        {
          id: 'created-last24h',
          label: 'Last 24 Hours',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-created-last24h',
            field: 'created',
            type: 'timeRange',
            value: { range: 'last24h' },
            label: 'created: Last 24 Hours',
          },
        },
        {
          id: 'created-last7d',
          label: 'Last 7 Days',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-created-last7d',
            field: 'created',
            type: 'timeRange',
            value: { range: 'last7d' },
            label: 'created: Last 7 Days',
          },
        },
        {
          id: 'created-last30d',
          label: 'Last 30 Days',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-created-last30d',
            field: 'created',
            type: 'timeRange',
            value: { range: 'last30d' },
            label: 'created: Last 30 Days',
          },
        },
      ],
    },
    {
      field: 'lastUpdated',
      label: 'lastUpdated',
      filterType: 'timeRange',
      presets: [
        {
          id: 'lastUpdated-last24h',
          label: 'Last 24 Hours',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-lastUpdated-last24h',
            field: 'lastUpdated',
            type: 'timeRange',
            value: { range: 'last24h' },
            label: 'lastUpdated: Last 24 Hours',
          },
        },
        {
          id: 'updated-last7d',
          label: 'Last 7 Days',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-updated-last7d',
            field: 'lastUpdated',
            type: 'timeRange',
            value: { range: 'last7d' },
            label: 'lastUpdated: Last 7 Days',
          },
        },
        {
          id: 'updated-last30d',
          label: 'Last 30 Days',
          icon: <AccessTime />,
          color: 'primary',
          filter: {
            id: 'preset-updated-last30d',
            field: 'lastUpdated',
            type: 'timeRange',
            value: { range: 'last30d' },
            label: 'lastUpdated: Last 30 Days',
          },
        },
      ],
    },
  ],

  filterFunctions: {
    created: (objects: any[], filter: any) => {
      const now = new Date();
      now.setSeconds(0, 0); // minute precision
      let startDate: Date;
      const range = filter.value?.range;

      switch (range) {
        case 'last24h': {
          const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'last7d': {
          const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'last30d': {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'custom': {
          const cs: Date | undefined = filter.value?.customStart
            ? new Date(filter.value.customStart)
            : undefined;
          const ce: Date | undefined = filter.value?.customEnd
            ? new Date(filter.value.customEnd)
            : undefined;
          startDate = cs ? new Date(cs) : new Date(0);
          startDate.setSeconds(0, 0);
          // Default end to current minute if not provided
          const endCandidate = ce ? new Date(ce) : new Date(now);
          endCandidate.setSeconds(0, 0);
          const endDate = endCandidate;

          return objects.filter((object: any) => {
            const fieldValue = object[filter.field];
            if (!fieldValue) return false;
            const objectDate = new Date(fieldValue);
            return objectDate >= startDate && objectDate <= endDate;
          });
        }
        default:
          return objects;
      }

      // Non-custom ranges: end at current minute
      const endDate = new Date(now);
      endDate.setSeconds(0, 0);

      return objects.filter((object: any) => {
        const fieldValue = object[filter.field];
        if (!fieldValue) return false;

        const objectDate = new Date(fieldValue);
        return objectDate >= startDate && objectDate <= endDate;
      });
    },
    lastUpdated: (objects: any[], filter: any) => {
      const now = new Date();
      now.setSeconds(0, 0); // minute precision
      let startDate: Date;
      const range = filter.value?.range;

      switch (range) {
        case 'last24h': {
          const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'last7d': {
          const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'last30d': {
          const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          d.setSeconds(0, 0);
          startDate = d;
          break;
        }
        case 'custom': {
          const cs: Date | undefined = filter.value?.customStart
            ? new Date(filter.value.customStart)
            : undefined;
          const ce: Date | undefined = filter.value?.customEnd
            ? new Date(filter.value.customEnd)
            : undefined;
          startDate = cs ? new Date(cs) : new Date(0);
          startDate.setSeconds(0, 0);
          // Default end to current minute if not provided
          const endCandidate = ce ? new Date(ce) : new Date(now);
          endCandidate.setSeconds(0, 0);
          const endDate = endCandidate;

          return objects.filter((object: any) => {
            const fieldValue = object[filter.field];
            if (!fieldValue) return false;
            const objectDate = new Date(fieldValue);
            return objectDate >= startDate && objectDate <= endDate;
          });
        }
        default:
          return objects;
      }

      // Non-custom ranges: end at current minute
      const endDate = new Date(now);
      endDate.setSeconds(0, 0);

      return objects.filter((object: any) => {
        const fieldValue = object[filter.field];
        if (!fieldValue) return false;

        const objectDate = new Date(fieldValue);
        return objectDate >= startDate && objectDate <= endDate;
      });
    },
  },
};

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
          filterable={true}
          filterConfig={jobFilterConfig}
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
