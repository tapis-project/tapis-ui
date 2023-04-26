import React, { useCallback, useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { GenericModal, LoadingSpinner } from 'tapis-ui/_common';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import styles from './CreateTaskModal.module.scss';
import { Task } from './_components/forms';
import { TaskTypeSelector } from './_components';
import { useCreate } from 'tapis-hooks/workflows/tasks';
import { useDetails } from 'tapis-hooks/workflows/pipelines';
import { default as queryKeys } from 'tapis-hooks/workflows/tasks/queryKeys';
import { useQueryClient } from 'react-query';

type CreateTaskModalProps = {
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
  toggle,
  groupId,
  pipelineId,
}) => {
  const { create, isLoading, isSuccess, error } = useCreate();
  const {
    data,
    isLoading: isLoadingPipeline,
    error: errorPipeline,
  } = useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.list);
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
    <GenericModal
      toggle={toggle}
      size="lg"
      title="Create Task"
      body={
        <div className={styles['form-container']}>
          {isLoadingPipeline ? (
            <LoadingSpinner />
          ) : type ? (
            <Task type={type} pipeline={pipeline} onSubmit={onSubmit} />
          ) : (
            <TaskTypeSelector setType={setType} />
          )}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading || isLoadingPipeline}
          error={error || errorPipeline}
          success={isSuccess ? `Successfully created task` : ''}
          reverse={true}
        >
          <Button
            form="newtask-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Task
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateTaskModal;
