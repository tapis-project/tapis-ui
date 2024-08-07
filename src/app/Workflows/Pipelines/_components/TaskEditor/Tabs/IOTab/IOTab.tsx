import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';
import { usePatchTask } from 'app/Workflows/_hooks';

const IOTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { taskPatch } =
    usePatchTask<Workflows.Task>();
  return (
    <Sidebar
      title={'Inputs & Outputs'}
      toggle={toggle}
    >
      {JSON.stringify(taskPatch.input)}
      {JSON.stringify(taskPatch.output)}
    </Sidebar>
  );
};

export default IOTab;
