import { createContext } from "react";

export type TaskUpdateContextProps<T> = {
    groupId: string,
    pipelineId: string,
    task: T;
    tasks: Array<T>
    taskPatch: Partial<T>
    setTaskPatch: (
        task: T,
        patch: Partial<T>
    ) => void
}

export const TaskUpdateContext = createContext<TaskUpdateContextProps<any> | null>(null)