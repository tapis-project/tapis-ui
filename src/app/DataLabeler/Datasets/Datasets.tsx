import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, Icon, SectionHeader } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { SelectionBar } from '../_components';
import styles from './Datasets.module.scss';
import { CircularProgress } from '@mui/material';
import { PeopleAlt } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const Datasets: React.FC = () => {
  const { data, isLoading, error } = Hooks.Groups.useList();
  const dataset1 = {
    id: '0123456789',
    system: 'systemname_tacc_123',
    datasetpath: '/fs/frontera/swathivm/MD/test',
  };
  const dataset2 = {
    id: '9876543210',
    system: 'systemname_osc_123',
    datasetpath: '/fs/scratch/pas0536/MD/test',
  };
  const datasets = [dataset1, dataset2];
  // const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <div className={styles['container']}>
      <QueryWrapper isLoading={isLoading} error={error}>
        <SelectionBar
          selectFormItems={[
            'selectSystem',
            'selectDataset',
            'addDataset',
            'addAllDatasets',
            'configureDataset',
          ]}
        />
      </QueryWrapper>
      <SectionHeader>
        <span>
          <PeopleAlt fontSize={'large'} /> Training Datasets
        </span>
      </SectionHeader>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={(datasets || []).map((dataset) => {
            return {
              ...dataset,
              id: dataset.id,
            };
          })}
          columns={[
            { field: 'id', headerName: 'Dataset ID', width: 200 },
            { field: 'system', headerName: 'System ID', width: 200 },
            { field: 'datasetpath', headerName: 'Dataset Path', width: 300 },
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
  );
};

export default Datasets;
