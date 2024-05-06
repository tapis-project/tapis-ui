import { MutableRefObject, useState, useCallback } from "react";
import { Workflows } from "@tapis/tapis-typescript"
import styles from "./PipelineDAGView.module.scss"
import { useMouseCoordinates } from "tapis-hooks/context";
import { Node } from "."

type SelectedAnchorDetails = {
  ref: MutableRefObject<HTMLDivElement | null> | null
  taskId: string | null
  anchorType: "left" | "right" | null
}

const PipelineDAGView: React.FC<{ tasks: Array<Workflows.Task> }> = ({ tasks }) => {
  const [ currentTask, setCurrentTask ] = useState<Workflows.Task | undefined>(undefined)
  const selectedAnchorInitialState = {
    ref: null,
    taskId: null,
    anchorType: null
  }
  const [ selectedAnchor, setSelectedAnchor ] = useState<SelectedAnchorDetails>(
    selectedAnchorInitialState
  )
  const mouseCoordinates = useMouseCoordinates()

  const resolveHideAnchorType = (
    selectedAnchor: SelectedAnchorDetails,
    taskId: string
  ) => {
    if (selectedAnchor.anchorType === undefined) { return undefined }

    if (taskId == selectedAnchor.taskId && selectedAnchor.anchorType == "left") {
      return "right"
    }

    if (taskId == selectedAnchor.taskId && selectedAnchor.anchorType == "right") {
      return "left"
    }

    if (selectedAnchor.anchorType == "right") {
      return "right"
    }

    if (selectedAnchor.anchorType == "left") {
      return "left"
    }

    return undefined
  }

  const orderTasks = useCallback((tasks: Array<Workflows.Task>) => {
    tasks.map((task) => {})
  }, [tasks]);

  return (
    <div className={styles["dag-container"]}>
      {
        currentTask === undefined ?
        <div
          className={styles["dag"]}
          onClick={() => {setSelectedAnchor(selectedAnchorInitialState)}}
        >
          {
            tasks.map((task: Workflows.Task) => {
              return (
                <Node
                  id={task.id}
                  description={task.description}
                  onClickNode={() => {
                    setSelectedAnchor(selectedAnchorInitialState);
                    setCurrentTask(task);
                  }}
                  hideAnchorType={resolveHideAnchorType(
                    selectedAnchor,
                    task.id
                  )}
                  handleLeftAnchorClick={(anchor) => {
                    if (
                      selectedAnchor !== null
                      && selectedAnchor.taskId !== task.id
                      && selectedAnchor.anchorType == "right"
                    ) {
                      alert(`Create dependency created between ${selectedAnchor.taskId} and ${task.id}`)
                      setSelectedAnchor(selectedAnchorInitialState)
                      return
                    }

                    if (
                      selectedAnchor !== null
                      && selectedAnchor.taskId === task.id
                    ) {
                      setSelectedAnchor(selectedAnchorInitialState)
                      return
                    }

                    setSelectedAnchor({
                      ref: anchor,
                      taskId: task.id,
                      anchorType: "left"
                    })
                  }}
                  handleRightAnchorClick={(anchor) => {
                    if (
                      selectedAnchor !== null
                      && selectedAnchor.taskId !== task.id
                      && selectedAnchor.anchorType == "left"
                    ) {
                      alert(`Create reverse dependency created between ${selectedAnchor.taskId} and ${task.id}`)
                      setSelectedAnchor(selectedAnchorInitialState)
                      return
                    }

                    if (
                      selectedAnchor !== null
                      && selectedAnchor.taskId === task.id
                    ) {
                      setSelectedAnchor(selectedAnchorInitialState)
                      return
                    }

                    setSelectedAnchor({
                      ref: anchor,
                      taskId: task.id,
                      anchorType: "right"
                    })
                  }}
                />
              );
            })
          }
        </div> : 
        <div className={`${styles["node-details"]}`}>
          <div
            className={`${styles["node-details-close"]}`}
            onClick={() => {setCurrentTask(undefined)}}
          >
            &#x2715;
          </div>
          <p>id: {currentTask.id}</p>
          <p>type: {currentTask.type}</p>
          <p>description: {currentTask.description}</p>
        </div>
      }
    </div>
  );
};

export default PipelineDAGView