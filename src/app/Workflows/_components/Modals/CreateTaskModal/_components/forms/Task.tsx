import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  ImageBuildTask,
  RequestTask,
  TapisJobTask,
  TapisActorTask,
  FunctionTask,
} from '.';
import { ReqTaskTransform } from '../../CreateTaskModal';

type TaskProps = {
  type: string;
  pipeline: Workflows.Pipeline;
  onSubmit: (reqTask: ReqTaskTransform) => void;
};

export type TaskFormProps = { pipeline: Workflows.Pipeline; onSubmit: any };

const Task: React.FC<TaskProps> = ({ type, pipeline, onSubmit }) => {
  switch (type) {
    case Workflows.EnumTaskType.ImageBuild:
      return <ImageBuildTask onSubmit={onSubmit} pipeline={pipeline} />;
    case Workflows.EnumTaskType.Request:
      return <RequestTask onSubmit={onSubmit} pipeline={pipeline} />;
    case Workflows.EnumTaskType.TapisJob:
      return <TapisJobTask onSubmit={onSubmit} pipeline={pipeline} />;
    case Workflows.EnumTaskType.TapisActor:
      return <TapisActorTask onSubmit={onSubmit} pipeline={pipeline} />;
    case Workflows.EnumTaskType.Function:
      return <FunctionTask onSubmit={onSubmit} pipeline={pipeline} />;
    default:
      return <>Unsupported task type</>;
  }
};

export default Task;
