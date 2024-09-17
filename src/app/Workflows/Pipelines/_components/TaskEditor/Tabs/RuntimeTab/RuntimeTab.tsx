import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './RuntimeTab.module.scss';
import {
  Box,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Sidebar } from '../../../Sidebar';
import { usePatchTask } from 'app/Workflows/_hooks';

const RuntimeTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.FunctionTask>();

  const packageConverter = (
    packages: Array<string> | string,
    reverse = false
  ) => {
    if (!reverse) {
      let packageString = '';
      (packages as Array<string>).map((name) => {
        packageString += name + '\n';
      });

      return packageString;
    }

    const splitPackages = (packages as string)
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s/g, ' ')
      .split(' ');
    return splitPackages;
  };

  return (
    <Sidebar title={'Runtime'} toggle={toggle}>
      <div className={styles['form']}>
        <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
          <InputLabel size="small" id="environment">
            Runtime environment
          </InputLabel>
          <Select
            size="small"
            label="Runtime environment"
            labelId="environment"
            defaultValue={taskPatch.runtime}
            onChange={(e) => {
              setTaskPatch(task, {
                runtime: e.target.value as Workflows.EnumRuntimeEnvironment,
              });
            }}
          >
            {Object.values(Workflows.EnumRuntimeEnvironment).map(
              (runtimeEnv) => {
                return (
                  <MenuItem
                    value={runtimeEnv}
                    selected={runtimeEnv === task.runtime!}
                  >
                    {runtimeEnv}
                  </MenuItem>
                );
              }
            )}
          </Select>
        </FormControl>
        <FormHelperText>
          The runtime envrionment in which the function code will be executed
        </FormHelperText>
        <TextField
          label="Packages"
          variant="outlined"
          multiline
          rows={4}
          defaultValue={packageConverter(taskPatch.packages || [])}
          margin="normal"
          style={{ marginBottom: '-16px' }}
          onChange={(e) => {
            setTaskPatch(task, {
              packages: packageConverter(e.target.value, true) as Array<string>,
            });
          }}
        />
        <FormHelperText>
          Each package must be on a seperate line. May be just the package name
          or the pacakge name followed by the version. Ex. tapipy==^1.6.0
        </FormHelperText>
        <FormControl
          fullWidth
          margin="normal"
          style={{ marginBottom: '-16px' }}
        >
          <InputLabel size="small" id="installer">
            Installer
          </InputLabel>
          <Select
            size="small"
            label="Installer"
            defaultValue={taskPatch.installer}
            onChange={(e) => {
              setTaskPatch(task, {
                installer: e.target.value as Workflows.EnumInstaller,
              });
            }}
          >
            {Object.values(Workflows.EnumInstaller).map((installer) => {
              return (
                <MenuItem
                  selected={installer === task.installer}
                  value={installer}
                >
                  {installer}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormHelperText>
          Choose which installer to use to install the packages above
        </FormHelperText>
      </div>
    </Sidebar>
  );
};

export default RuntimeTab;
