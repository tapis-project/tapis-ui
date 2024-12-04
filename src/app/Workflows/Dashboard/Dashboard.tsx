import React, { useState } from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import pStyles from '../_components/PipelineCard/PipelineCard.module.scss';
import styles from './Dashboard.module.scss';
import { PipelineCard } from '../_components';
import { Skeleton, Pagination } from '@mui/material';
import { Workflows } from '@tapis/tapis-typescript';
import { SectionHeader, Help } from '@tapis/tapisui-common';
import { DashboardCard } from '../_components/DashboardCard';
import { PeopleAlt, Storage, AccountTree, Key } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useHistory } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useHistory();
  const groups = Hooks.Groups.useList();
  const groupIds: Array<string> = [];
  const groupMapping: { [key: string]: Workflows.Group } = {};
  groups.data?.result.map((group) => {
    if (group) {
      groupIds.push(group.id!);
      groupMapping[group.uuid!] = group;
    }
  });
  // const identities = Hooks.Identities.useList();
  const archives = Hooks.Archives.useListAll({ groupIds });
  const { data: pipelines, isLoading } = Hooks.Pipelines.useListAll({
    groupIds,
  });
  const secrets = Hooks.Secrets.useList();
  const [page, setPage] = useState<number>(1);
  return (
    <div>
      <div className={styles['dashboard-card-container']}>
        <DashboardCard
          isLoading={groups.isLoading}
          to="/workflows/groups"
          title={'Groups'}
          objects={groups?.data?.result || []}
          icon={<PeopleAlt fontSize={'large'} />}
        />
        <DashboardCard
          isLoading={isLoading}
          to="/workflows/pipelines"
          title={'Pipelines'}
          objects={pipelines?.result || []}
          icon={<AccountTree fontSize={'large'} />}
        />
        <DashboardCard
          isLoading={archives.isLoading}
          to="/workflows/archives"
          title={'Archives'}
          objects={archives?.data?.result || []}
          icon={<Storage fontSize={'large'} />}
        />
        <DashboardCard
          isLoading={secrets.isLoading}
          to="/workflows/secrets"
          title={'Secrets'}
          objects={secrets?.data?.result || []}
          icon={<Key fontSize={'large'} />}
        />
      </div>
      <div className={pStyles['cards-container']}>
        <SectionHeader>
          <span>
            <AccountTree fontSize={'large'} /> Pipelines{' '}
            {pipelines && `[${pipelines.result.length}]`}
          </span>
        </SectionHeader>
        {pipelines && pipelines.result.length > 0 && (
          <Pagination
            className={pStyles['paginator']}
            shape="rounded"
            count={Math.ceil(pipelines.result.length / 6)}
            showFirstButton
            showLastButton
            page={page}
            onChange={(_, value) => {
              setPage(value);
            }}
          />
        )}
        {isLoading ? (
          <div
            className={`${pStyles['cards']} ${pStyles['skeletons']} ${pStyles['col-3']}`}
          >
            {[...Array(6).keys()].map(() => {
              return (
                <Skeleton
                  variant="rectangular"
                  height="120px"
                  className={`${pStyles['card']} ${pStyles['skeleton']}`}
                />
              );
            })}
          </div>
        ) : (
          <div className={`${pStyles['cards']} ${pStyles['col-3']}`}>
            {pipelines?.result &&
              pipelines.result.map((pipeline, i) => {
                // Determine the page value for each card given that there are
                // 6 cards per page
                i++;
                if (i > 6 * page || i <= 6 * page - 6) {
                  return <></>;
                }
                return (
                  <PipelineCard
                    pipeline={pipeline}
                    groupId={groupMapping[pipeline.group!].id!}
                  />
                );
              })}
          </div>
        )}
      </div>
      <div className={styles['container']}>
        <SectionHeader>
          <span>
            <PeopleAlt fontSize={'large'} /> Groups{' '}
            {groups?.data?.result && `[${groups.data.result.length}]`}
          </span>
        </SectionHeader>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            onRowClick={(rowData) => {
              navigate.push(`/workflows/groups/${rowData.id}`);
            }}
            rows={(groups?.data?.result || []).map((group) => {
              return {
                ...group,
                id: group.id,
              };
            })}
            columns={[
              { field: 'id', headerName: 'Group ID', width: 200 },
              { field: 'owner', headerName: 'Owner', width: 200 },
              { field: 'tenant_id', headerName: 'Tenant', width: 200 },
              { field: 'uuid', headerName: 'UUID', width: 220 },
            ]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
