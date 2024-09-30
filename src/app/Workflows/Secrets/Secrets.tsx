import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionHeader } from '@tapis/tapisui-common';
import { Delete, Key } from '@mui/icons-material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Toolbar } from '../_components';
import { IconButton, Alert, AlertTitle } from '@mui/material';
import { SecretsHelp } from 'app/_components/Help';

const Secrets: React.FC = () => {
  const { data, isLoading, error } = Hooks.Secrets.useList();
  const {
    remove,
    invalidate,
    isLoading: isDeleting,
    error: deleteError,
    isError: isDeleteError,
    reset,
  } = Hooks.Secrets.useDelete();
  const secrets: Array<Workflows.Secret> = data?.result ?? [];
  return (
    <div>
      <QueryWrapper isLoading={isLoading} error={error}>
        <div>
          <SectionHeader>
            <span>
              <Key fontSize={'large'} /> Secrets{' '}
              {secrets && ` [${secrets.length}]`}
              <span style={{ marginLeft: '16px' }}>
                <SecretsHelp />
              </span>
            </span>
            <Toolbar buttons={['createsecret']} />
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
          <div style={{ width: '100%' }}>
            <DataGrid
              getRowHeight={() => 'auto'}
              rows={(secrets || []).map((secret) => {
                return {
                  ...secret,
                  id: secret.id,
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
                { field: 'id', headerName: 'Secret ID', width: 200 },
                {
                  field: 'description',
                  headerName: 'Description',
                  width: 300,
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  sortable: false,
                },
                {
                  field: 'sk_secret_name',
                  headerName: 'Secret Name',
                  width: 300,
                },
                {
                  field: 'actions',
                  type: 'actions',
                  hideSortIcons: true,
                  disableColumnMenu: true,
                  renderCell: (params) => {
                    return (
                      <IconButton
                        disabled={isDeleting}
                        onClick={() => {
                          remove(
                            { secretId: params.row.id! },
                            {
                              onSuccess: () => {
                                invalidate();
                              },
                            }
                          );
                        }}
                      >
                        <Delete color="error" />
                      </IconButton>
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
        </div>
      </QueryWrapper>
    </div>
  );
};

export default Secrets;
