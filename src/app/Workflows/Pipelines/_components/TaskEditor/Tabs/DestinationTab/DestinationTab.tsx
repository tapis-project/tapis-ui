import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './DestinationTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import { Sidebar } from '../../../Sidebar';

const DestinationTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.ImageBuildTask>();
  return (
    <Sidebar title={'Destination'} toggle={toggle}>
      <div className={`${styles['form']}`}>
        {JSON.stringify(taskPatch.destination)}
      </div>
    </Sidebar>
  );
};

export default DestinationTab;
