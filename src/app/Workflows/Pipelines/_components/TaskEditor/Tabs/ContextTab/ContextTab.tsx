import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './ContextTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import { Sidebar } from '../../../Sidebar';

const ContextTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.ImageBuildTask>();
  return (
    <Sidebar title={'Source'} toggle={toggle}>
      <div className={`${styles['form']}`}>
        {JSON.stringify(taskPatch.context, null, 2)}
      </div>
    </Sidebar>
  );
};

export default ContextTab;
