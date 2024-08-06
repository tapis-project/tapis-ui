import { usePatchTask } from 'app/Workflows/_hooks';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';

const GitTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const {
    task,
    taskPatch,
    setTaskPatch,
    commit,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
  } = usePatchTask<Workflows.FunctionTask>();
  return (
    <Sidebar title={'Git Repositories'} toggle={toggle}>
      Coming soon
    </Sidebar>
  );
};

export default GitTab;
