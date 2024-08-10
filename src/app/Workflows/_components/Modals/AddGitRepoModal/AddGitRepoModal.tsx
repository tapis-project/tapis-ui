import React, { useEffect, useState, useRef } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './AddGitRepoModal.module.scss';
import { LoadingButton as Button } from '@mui/lab';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
  Input,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { usePatchTask } from 'app/Workflows/_hooks';
import { listRepos, listBranches } from 'app/apis/Github';

type AddGitRepoModalProps = {
  open: boolean;
  toggle: () => void;
};

const UpdateRuntimeModal: React.FC<AddGitRepoModalProps> = ({
  open,
  toggle,
}) => {
  const {
    task,
    taskPatch,
    setTaskPatch,
    commit,
    isLoading,
    isError,
    isSuccess,
    error: patchError,
    reset,
  } = usePatchTask<Workflows.FunctionTask>();

  const [username, setUsername] = useState<string | undefined>(undefined);
  const [repos, setRepos] = useState<Array<{ [key: string | number]: any }>>(
    []
  );
  const [repo, setRepo] = useState<{ [key: string | number]: any } | undefined>(
    undefined
  );
  const [branches, setBranches] = useState<
    Array<{ [key: string | number]: any }> | []
  >([]);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [cloneDir, setCloneDir] = useState<string | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  const resetGit = () => {
    setUsername(undefined);
    setRepos([]);
    setRepo(undefined);
    setBranches([]);
    setBranch(undefined);
    setError(undefined);
  };

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
        { username, repo: repo.name },
        {
          onSuccess: (response) => {
            setBranches(response.result!);
          },
          onError: (response) => {
            setError(response.error), setBranches([]);
          },
        }
      );
    }
  }, [repo]);
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      aria-labelledby="Update task git repos modal"
      aria-describedby="A modal for updating a a funcction tasks git repos"
    >
      <DialogTitle id="alert-dialog-title">Add Git Repo</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully added git repo '{username && username + '/'}
            {repo && repo.name}
            {branch && ':' + branch}'
          </Alert>
        )}
        {((isError && patchError) || error) && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error && error.message}
            {patchError && patchError.message}
          </Alert>
        )}
        {username && username + '/'}
        {repo && repo.name}
        {branch && ':' + branch}
        <div className={styles['form']}>
          {repos.length < 1 && (
            <>
              <FormControl variant="standard">
                <InputLabel htmlFor="organization-username">
                  Organization/Username
                </InputLabel>
                <Input
                  id="organization-username"
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
              <Button
                onClick={() => {
                  if (searchRef.current) {
                    setUsername(searchRef.current.value);
                  }
                }}
              >
                Search
              </Button>
            </>
          )}
          {repos.length > 0 && branches.length < 1 && (
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
                          setRepo(repo);
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
          {repo && branches && !branch && (
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
          {username && branch && repo && (
            <>
              <FormControl variant="standard">
                <InputLabel htmlFor="clone-directory">
                  Clone directory
                </InputLabel>
                <Input
                  id="clone-directory"
                  disabled={isSuccess}
                  onChange={(e) => {
                    setTaskPatch(task, {
                      git_repositories: [
                        ...(task.git_repositories || []),
                        {
                          url: repo.clone_url,
                          branch: branch,
                          directory: e.target.value,
                        },
                      ],
                    });
                    setCloneDir(e.target.value);
                  }}
                />
              </FormControl>
              <FormHelperText>
                The repository will be cloned into this directory inside of the
                task's exection directory
              </FormHelperText>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            resetGit();
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          onClick={commit}
          disabled={isSuccess || !username || !branch || !branch || !cloneDir}
          loading={isLoading}
          variant="outlined"
          autoFocus
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateRuntimeModal;
