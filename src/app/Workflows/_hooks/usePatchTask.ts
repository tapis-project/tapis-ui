import { useContext } from 'react';
import {
  TaskUpdateContext,
  type TaskUpdateContextProps,
} from 'app/Workflows/_context';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Workflows } from '@tapis/tapis-typescript';

type UsePatchTask<T> = TaskUpdateContextProps<T> &
  Omit<ReturnType<typeof Hooks.Tasks.usePatch>, 'patch'> & {
    commit: () => void;
  };

const usePatchTask = <T>(): UsePatchTask<T> => {
  const context = useContext(
    TaskUpdateContext
  ) as TaskUpdateContextProps<T> | null;
  if (context === null) {
    throw new Error(
      'usePatchTask must be used within a TaskUpdateContextProvider'
    );
  }

  const { groupId, pipelineId, task, taskPatch } = context!;
  const usePatchHook = Hooks.Tasks.usePatch();
  const { patch } = usePatchHook;

  const commit = () => {
    patch(
      {
        groupId,
        pipelineId,
        taskId: (task as Workflows.Task).id!,
        task: taskPatch as unknown as Workflows.Task,
      },
      {
        onSuccess: () => {
          context.setDirty(false);
          usePatchHook.invalidate();
        },
      }
    );
  };

  const modifiedUsePatchHook: Omit<
    ReturnType<typeof Hooks.Tasks.usePatch>,
    'patch'
  > & { patch?: typeof patch } = { ...usePatchHook };
  delete modifiedUsePatchHook.patch;

  return {
    ...context,
    ...modifiedUsePatchHook,
    commit,
  };
};

export default usePatchTask;
