import { usePatchTask } from 'app/Workflows/_hooks';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';
import { useState } from 'react';
import styles from './GitTab.module.scss';
import { Button, Chip } from '@mui/material';
import { AddGitRepoModal } from 'app/Workflows/_components/Modals';
import { Add } from '@mui/icons-material';

const GitTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const {
    task,
    taskPatch,
    setTaskPatch,
    commit,
    isLoading,
    isError,
    isSuccess,
    // error,
    reset,
  } = usePatchTask<Workflows.FunctionTask>();

  const [modal, setModal] = useState<string | undefined>(undefined);

  return (
    <Sidebar title={'Git Repositories'} toggle={toggle}>
      <div className={styles['chips']}>
        {!taskPatch.git_repositories?.length && 'No git repositories'}
        {(taskPatch.git_repositories ? taskPatch.git_repositories : []).map(
          (repo) => {
            return (
              <Chip
                label={`${repo.url!.replace('https://github.com/', '')}:${
                  repo.branch
                } ${repo.directory}`}
                onDelete={() => {
                  setTaskPatch(task, {
                    git_repositories: [
                      ...(taskPatch.git_repositories || []).filter(
                        (r) => repo.url !== r.url
                      ),
                    ],
                  });
                }}
              />
            );
          }
        )}
      </div>
      <div className={styles['form']}>
        <Button
          onClick={() => {
            setModal('git');
          }}
          startIcon={<Add />}
        >
          Add Git Repo
        </Button>
      </div>
      <AddGitRepoModal
        open={modal === 'git'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </Sidebar>
  );
};

export default GitTab;
