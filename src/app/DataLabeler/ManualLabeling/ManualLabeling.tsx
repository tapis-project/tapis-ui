import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { SelectionBar } from '../_components';
import styles from './ManualLabeling.module.scss';
import { CircularProgress } from '@mui/material';

const ManualLabeling: React.FC = () => {
  const { data, isLoading, error } = Hooks.Groups.useList();
  const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <div className={styles['container']}>
      <QueryWrapper isLoading={isLoading} error={error}>
        <SelectionBar
          selectFormItems={['selectTargetDataset', 'fetchAllData']}
        />
      </QueryWrapper>
    </div>
  );
};

export default ManualLabeling;
