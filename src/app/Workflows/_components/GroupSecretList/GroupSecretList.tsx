import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  SectionMessage,
  SectionHeader,
  QueryWrapper,
} from '@tapis/tapisui-common';
import { Toolbar } from '../../_components';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Delete, Key } from '@mui/icons-material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { Alert, AlertTitle } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GroupSecretsHelp } from 'app/_components/Help';

type GroupSecretListProps = {
  groupId: string;
};

const GroupSecretList: React.FC<GroupSecretListProps> = ({ groupId }) => {
  const {
    data: groupSecretData,
    isLoading: groupSecretsIsLoading,
    error: groupSecretsError,
  } = Hooks.GroupSecrets.useList({ groupId });
  const groupSecrets: Array<Workflows.GroupSecret> =
    groupSecretData?.result ?? [];
  const {
    remove,
    invalidate,
    isLoading: isDeleting,
    error: deleteError,
    isError: isDeleteError,
    reset,
  } = Hooks.GroupSecrets.useDelete();
  return (
    <div>
      <SectionHeader>
        <span>
          <span>
            <Key fontSize="large" /> Group Secrets [{groupSecrets.length}]
          </span>
          <span style={{ marginLeft: '16px' }}>
            <GroupSecretsHelp />
          </span>
        </span>
        <Toolbar groupId={groupId} buttons={['addgroupsecret']} />
      </SectionHeader>
      {isDeleteError && (
        <Alert
          severity="error"
          style={{ marginTop: '8px' }}
          onClose={() => {
            reset();
          }}
        >
          <AlertTitle>Error</AlertTitle>
          {deleteError && deleteError.message}
        </Alert>
      )}
      <div>
        <QueryWrapper
          isLoading={groupSecretsIsLoading}
          error={groupSecretsError}
        >
          <div id="group-secrets">
            {groupSecrets.length ? (
              <div style={{ width: '100%' }}>
                <DataGrid
                  getRowHeight={() => 'auto'}
                  rows={(groupSecrets || []).map((groupSecret) => {
                    return {
                      id: groupSecret.id,
                      source: groupSecret.secret!.id,
                      description: groupSecret.secret!.description,
                      owner: groupSecret.secret!.owner,
                    };
                  })}
                  sx={{
                    [`& .${gridClasses.cell}`]: {
                      py: 1,
                    },
                    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                      borderRight: '1px solid #f0f0f0',
                    },
                  }}
                  columns={[
                    { field: 'id', headerName: 'Group Secret ID', width: 200 },
                    {
                      field: 'source',
                      headerName: 'Group Secret Source',
                      width: 300,
                      hideSortIcons: true,
                      sortable: false,
                    },
                    {
                      field: 'description',
                      headerName: 'Description',
                      width: 300,
                      hideSortIcons: true,
                      disableColumnMenu: true,
                      sortable: false,
                    },
                    {
                      field: 'owner',
                      headerName: 'Owner',
                      width: 300,
                      disableColumnMenu: true,
                    },
                    {
                      field: 'actions',
                      type: 'actions',
                      hideSortIcons: true,
                      disableColumnMenu: true,
                      renderCell: (params) => {
                        return (
                          <LoadingButton
                            disabled={isDeleting}
                            loading={isDeleting}
                            onClick={() => {
                              remove(
                                {
                                  groupId,
                                  groupSecretId: params.row.id!,
                                },
                                {
                                  onSuccess: () => {
                                    invalidate();
                                  },
                                }
                              );
                            }}
                          >
                            <Delete color="error" />
                          </LoadingButton>
                        );
                      },
                    },
                  ]}
                  autosizeOptions={{
                    includeOutliers: false,
                  }}
                  rowSelection={false}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                />
              </div>
            ) : (
              <SectionMessage type="info">No group secrets</SectionMessage>
            )}
          </div>
        </QueryWrapper>
      </div>
    </div>
  );
};

export default GroupSecretList;
