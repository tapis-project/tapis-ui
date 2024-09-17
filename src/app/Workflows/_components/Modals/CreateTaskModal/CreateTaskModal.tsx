import React, { useCallback, useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { LoadingSpinner } from '@tapis/tapisui-common';
import styles from './CreateTaskModal.module.scss';
import { Task } from './_components/forms';
import { TaskTypeSelector } from './_components';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
} from '@mui/material';
import { LoadingButton as Button } from '@mui/lab';

type CreateTaskModalProps = {
  open: boolean;
  toggle: () => void;
  groupId: string;
  pipelineId: string;
};

type BaseInputType = {
  id: string;
  source: 'literal' | 'env' | 'params' | 'task_output';
};

type LiteralInputType = BaseInputType & {
  value: string | number;
};

type SourceInputType = {
  sourceKey: string;
};

type TaskOutputSourceInputType = {
  task_id: string;
  output_id: string;
};

export type InputType = LiteralInputType &
  SourceInputType &
  TaskOutputSourceInputType;

export type ReqTaskTransform = Omit<Workflows.ReqTask, 'input' | 'output'> & {
  input: Array<InputType>;
  // output: {[key: string]: object};
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  toggle,
  groupId,
  pipelineId,
}) => {
  const { create, isError, isLoading, isSuccess, error, reset } =
    Hooks.Tasks.useCreate();
  const {
    data,
    isLoading: isLoadingPipeline,
    error: errorPipeline,
  } = Hooks.Pipelines.useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Tasks.queryKeys.list);
    queryClient.invalidateQueries(Hooks.Pipelines.queryKeys.details);
  }, [queryClient]);

  const [type, setType] = useState<string>('');

  type InputTypeTransformFn = (inputs: Array<InputType>) => {
    [key: string]: object;
  };

  const inputsArrayToInputObject: InputTypeTransformFn = (inputs) => {
    const input: { [key: string]: object } = {};
    inputs.forEach((inp) => {
      switch (inp.source) {
        case 'literal':
          input[inp.id] = {
            type: 'string',
            value: inp.value,
          };
          break;
        case 'env':
          input[inp.id] = {
            type: 'string',
            value_from: { env: inp.sourceKey },
          };
          break;
        case 'params':
          input[inp.id] = {
            type: 'string',
            value_from: { params: inp.sourceKey },
          };
          break;
        case 'task_output':
          input[inp.id] = {
            type: 'string',
            value_from: {
              task_output: {
                task_id: inp.task_id,
                output_id: inp.output_id,
              },
            },
          };
          break;
      }
    });
    return input;
  };

  const onSubmit = (reqTask: ReqTaskTransform) => {
    let modifiedReqTask: Omit<Workflows.ReqTask, 'input'> & {
      input: { [key: string]: object };
    } = {
      ...reqTask,
      input: inputsArrayToInputObject(reqTask.input),
    };

    create(
      {
        groupId: groupId!,
        pipelineId: pipelineId!,
        reqTask: modifiedReqTask as Workflows.ReqTask,
      },
      { onSuccess }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="create task modal"
      aria-describedby="a modal to create a task"
      maxWidth="md"
      fullWidth={true}
    >
      <DialogTitle id="alert-dialog-title">Create task</DialogTitle>
      <DialogContent>
        {isSuccess && (
          <Alert severity="success" style={{ marginTop: '8px' }}>
            Successfully created task
          </Alert>
        )}
        {isError && error && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        <div className={styles['form-container']}>
          {isLoadingPipeline ? (
            <LoadingSpinner />
          ) : type ? (
            <Task type={type} pipeline={pipeline} onSubmit={onSubmit} />
          ) : (
            <TaskTypeSelector setType={setType} />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            reset();
            toggle();
          }}
        >
          {isSuccess ? 'Continue' : 'Cancel'}
        </Button>
        <Button
          form="newtask-form"
          type="submit"
          variant="outlined"
          loading={isLoading}
          disabled={isSuccess}
          autoFocus
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskModal;
