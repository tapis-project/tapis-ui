import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { ImageBuildTask, RequestTask } from '.';

type TaskProps = {
  type: string;
  onSubmit: (reqTask: Workflows.ReqTask) => void;
};

const Task: React.FC<TaskProps> = ({ type, onSubmit }) => {
  switch (type) {
    case Workflows.EnumTaskType.ImageBuild:
      return <ImageBuildTask onSubmit={onSubmit} />;
    case Workflows.EnumTaskType.Request:
      return <RequestTask onSubmit={onSubmit} />;
    default:
      return <>Unsupported task type</>;
  }
};

export default Task;
