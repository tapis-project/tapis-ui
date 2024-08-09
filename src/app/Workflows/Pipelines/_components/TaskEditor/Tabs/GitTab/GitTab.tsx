import { usePatchTask } from 'app/Workflows/_hooks';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';
import { useEffect, useRef, useState } from 'react';
import styles from './GitTab.module.scss';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Input,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { listRepos, listBranches } from 'app/apis/Github';

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

  const [username, setUsername] = useState<string | undefined>(undefined);
  const [repos, setRepos] = useState<Array<{ [key: string | number]: any }>>(
    []
  );
  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branches, setBranches] = useState<
    Array<{ [key: string | number]: any }> | undefined
  >(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (username) {
      listRepos(
        { username },
        {
          onSuccess: (response) => {
            setRepos(response.result!);
          },
          onError: (response) => {
            setError(response.error), setUsername(undefined);
          },
        }
      );
    }
  }, [username]);

  useEffect(() => {
    if (username && repo) {
      listBranches(
        { username, repo },
        {
          onSuccess: (response) => {
            setBranches(response.result!);
          },
          onError: (response) => {
            setError(response.error), setBranches(undefined);
          },
        }
      );
    }
  }, [repo, branches]);

  return (
    <Sidebar title={'Git Repositories'} toggle={toggle}>
      {error && (
        <Alert
          severity="error"
          style={{ marginTop: '8px' }}
          onClose={() => {
            setError(undefined);
          }}
        >
          <AlertTitle>Error</AlertTitle>
          {error.message}
        </Alert>
      )}
      <div className={styles['form']}>
        <>
          <FormControl variant="standard">
            <InputLabel htmlFor="username">Repository owner</InputLabel>
            <Input
              id="username"
              inputRef={searchRef}
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
            />
          </FormControl>
          <FormHelperText>
            The owner of the git repository you want to clone
          </FormHelperText>
        </>
        {repos.length > 0 && (
          <>
            <FormControl variant="standard">
              <InputLabel htmlFor="repo-search">Repository</InputLabel>
              <Select type="select" size="small" defaultValue="">
                <MenuItem disabled value="">
                  -- Choose a repository --
                </MenuItem>
                {repos.map((repo) => {
                  return (
                    <MenuItem
                      value={repo.name}
                      onClick={() => {
                        setRepo(repo.name);
                      }}
                    >
                      {repo.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormHelperText>
              The git repository to clone into the task's execution directory
            </FormHelperText>
          </>
        )}
        {repo && branches && (
          <>
            <FormControl variant="standard">
              <InputLabel htmlFor="branch-search">Branch</InputLabel>
              <Select type="select" size="small" defaultValue="">
                <MenuItem disabled value="">
                  -- Choose a branch --
                </MenuItem>
                {branches.map((branch) => {
                  return (
                    <MenuItem
                      value={branch.name}
                      onClick={() => {
                        setBranch(branch.name);
                      }}
                    >
                      {branch.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormHelperText>
              The branch of the repoistory to clone
            </FormHelperText>
          </>
        )}
        {branch && (
          <>
            <FormControl variant="standard">
              <InputLabel htmlFor="clone-directory">Clone directory</InputLabel>
              <Input id="clone-directory" />
            </FormControl>
            <FormHelperText>
              The repository will be cloned into this directory inside of the
              task's exection directory
            </FormHelperText>
          </>
        )}
        <Button
          onClick={() => {
            if (searchRef.current) {
              setUsername(searchRef.current.value);
            }
          }}
        >
          Search
        </Button>
      </div>
      <div>
        {task.git_repositories!.map((repo) => {
          return (
            <div>
              <p>{repo.url}</p>
              <p>{repo.branch}</p>
              <p>{repo.directory}</p>
            </div>
          );
        })}
      </div>
    </Sidebar>
  );
};

export default GitTab;
