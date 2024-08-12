import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';
import styles from './IOTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import {
  Button,
  List,
  Box,
  ListItem,
  ListItemButton,
  ListSubheader,
  ListItemText,
} from '@mui/material';
import { Add } from '@mui/icons-material';

const IOTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { taskPatch } = usePatchTask<Workflows.Task>();
  const getValueSource = (value: Workflows.SpecWithValue) => {
    if (value.value) {
      return `from literal: ${value.value}`;
    }

    const sourceKey = Object.keys(value.value_from!)[0];
    let source: string | undefined = undefined;
    console.log({ sourceKey });
    switch (sourceKey) {
      case 'args':
        source = value.value_from?.args;
        break;
      case 'env':
        source = value.value_from?.env;
        break;
      default:
        source = 'unknown';
    }

    return `from '${source}' in '${sourceKey}'`;
  };

  const input = Object.entries(taskPatch.input || {});
  const output = Object.entries(taskPatch.output || {});

  return (
    <Sidebar title={'Inputs & Outputs'} toggle={toggle}>
      <Box>
        <List
          subheader={
            <ListSubheader component="div" id="inputs">
              Inputs
            </ListSubheader>
          }
        >
          {input.length < 1 && (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText
                  primary={'No inputs'}
                  secondary={'Press the button below to add an input'}
                />
              </ListItemButton>
            </ListItem>
          )}
          {input.map(([key, value]) => {
            return (
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={`'${key}' as ${value.type} ${getValueSource(
                      value
                    )}`}
                    secondary={value.description}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <div className={styles['container']}>
        <Button startIcon={<Add />} onClick={() => {}}>
          Add Input
        </Button>
      </div>
      <Box>
        <List
          subheader={
            <ListSubheader component="div" id="inputs">
              Outputs
            </ListSubheader>
          }
        >
          {output.length < 1 && (
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText
                  primary={'No outputs'}
                  secondary={'Press the button below to add an output'}
                />
              </ListItemButton>
            </ListItem>
          )}
          {output.map(([key, value]) => {
            return (
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText
                    primary={`'${key}' as ${value} ${getValueSource(value)}`}
                    secondary={(value as any).type!}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <div className={styles['container']}>
        <Button startIcon={<Add />} onClick={() => {}}>
          Add Output
        </Button>
      </div>
    </Sidebar>
  );
};

export default IOTab;
