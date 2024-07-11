import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { SelectionBar } from '../_components';
import styles from './AutoLabeling.module.scss';
import { CircularProgress } from '@mui/material';

const AutoLabeling: React.FC = () => {
  const { data, isLoading, error } = Hooks.Groups.useList();
  const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <div className={styles['container']}>
      <QueryWrapper isLoading={isLoading} error={error}>
        <SelectionBar
          selectFormItems={[
            'selectModel',
            'selectSampleDataset',
            'showSampleDataModel',
            'selectTargetDataset',
            'labelSelectedData',
            'showAssignedLabels',
          ]}
        />
      </QueryWrapper>
    </div>
  );
};

export default AutoLabeling;
