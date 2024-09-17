import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './BuilderTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import { Sidebar } from '../../../Sidebar';

const BuilderTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.ImageBuildTask>();
  return (
    <Sidebar title={'Image Builder'} toggle={toggle}>
      <div className={`${styles['form']}`}>{taskPatch.builder}</div>
    </Sidebar>
  );
};

export default BuilderTab;
