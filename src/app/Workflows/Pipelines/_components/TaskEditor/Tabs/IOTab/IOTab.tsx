import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Sidebar } from '../../../Sidebar';
import styles from './IOTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import {
  Button,
  List,
  Box,
  IconButton,
  ListItemIcon,
  ListItem,
  ListSubheader,
  ListItemText,
} from '@mui/material';
import { Add, Delete, Input, Output } from '@mui/icons-material';
import {
  AddInputModal,
  AddOutputModal,
} from 'app/Workflows/_components/Modals';

const IOTab: React.FC<{ toggle: () => void; groupId: string }> = ({
  toggle,
  groupId,
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { taskPatch, setTaskPatch, task } = usePatchTask<Workflows.Task>();
  const getValueSource = (value: Workflows.SpecWithValue) => {
    if (value.value) {
      return `from literal: ${value.value}`;
    }
    if (!value.value_from) {
      return 'from unknown';
    }

    let sourceKey = undefined;
    for (let key of Object.keys(value.value_from!)) {
      if (
        ['args', 'env', 'task_output', 'secret'].includes(key) &&
        value.value_from[key as 'args' | 'env' | 'task_output' | 'secret'] !==
          undefined
      ) {
        sourceKey = key;
        break;
      }
    }
    let source:
      | string
      | Workflows.SecretRef
      | Workflows.TaskOutputRef
      | undefined = undefined;
    switch (sourceKey) {
      case 'args':
        source = value.value_from?.args;
        break;
      case 'env':
        source = value.value_from?.env;
        break;
      case 'task_output':
        source = value.value_from?.task_output;
        break;
      case 'secret':
        source = value.value_from?.secret;
        break;
      default:
        source = 'unknown';
    }

    if (sourceKey === 'task_output') {
      return (
        <>
          from task <b>{(source! as Workflows.TaskOutputRef).task_id}</b> {`(`}
          <b>output id: {(source! as Workflows.TaskOutputRef).output_id}</b>
          {`)`}
        </>
      );
    }

    if (sourceKey === 'secret') {
      return (
        <>
          from secret <b>{(source! as Workflows.SecretRef).pk}</b> {`(`}
          <b>engine: {(source! as Workflows.SecretRef).engine}</b>
          {`)`}
        </>
      );
    }

    return (
      <>
        from key <b>{source as string}</b> in <b>{sourceKey}</b>
      </>
    );
  };

  const input = Object.entries(taskPatch.input || {});
  const output = Object.entries(taskPatch.output || {});

  return (
    <Sidebar title={'Inputs & Outputs'} toggle={toggle}>
      <Box>
        <List
          subheader={
            <ListSubheader
              component="div"
              id="inputs"
              style={{ borderBottom: '1px solid #CCCCCC' }}
            >
              Inputs
            </ListSubheader>
          }
        >
          {input.length < 1 && (
            <ListItem>
              <ListItemText
                primary={'No inputs'}
                secondary={'Press the button below to add an input'}
              />
            </ListItem>
          )}
          {input.map(([key, value]) => {
            return (
              <ListItem
                secondaryAction={
                  <IconButton
                    aria-label="delete-input"
                    onClick={() => {
                      const modifiedInput = JSON.parse(
                        JSON.stringify(taskPatch.input!)
                      );
                      delete modifiedInput[key];
                      setTaskPatch(task, {
                        ...taskPatch,
                        input: modifiedInput,
                      });
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                }
                style={{ borderBottom: '1px solid #CCCCCC' }}
              >
                <ListItemIcon>
                  <Input />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      <b>{key}</b> ({value.type})
                    </>
                  }
                  secondary={getValueSource(value)}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
      <div className={styles['container']}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            setModal('input');
          }}
        >
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
            <ListItem>
              <ListItemText
                primary={'No outputs'}
                secondary={'Press the button below to add an output'}
              />
            </ListItem>
          )}
          {output.map(([key, value]) => {
            return (
              <ListItem
                secondaryAction={
                  <IconButton
                    aria-label="delete-output"
                    onClick={() => {
                      delete taskPatch.output![key];
                      setTaskPatch(task, taskPatch);
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                }
                style={{ borderBottom: '1px solid #CCCCCC' }}
              >
                <ListItemIcon>
                  <Output />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      <b>{key}</b>
                      {` (${(value as Workflows.Spec).type})`}
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
      <div className={styles['container']}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            setModal('output');
          }}
        >
          Add Output
        </Button>
      </div>
      <AddInputModal
        open={modal === 'input'}
        groupId={groupId}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <AddOutputModal
        open={modal === 'output'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </Sidebar>
  );
};

export default IOTab;
