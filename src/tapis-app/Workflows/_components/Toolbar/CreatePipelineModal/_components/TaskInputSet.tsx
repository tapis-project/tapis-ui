import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  ImageBuildTaskInputs,
  RequestTaskInputs,
} from "./inputs"

type TaskInputSetProps = {
  type: string,
  index: number
}

const TaskInputSet: React.FC<TaskInputSetProps> = ({type, index}) => {
  switch (type) {
    case Workflows.EnumTaskType.ImageBuild:
      return <ImageBuildTaskInputs index={index}/>
    case Workflows.EnumTaskType.Request:
      return <RequestTaskInputs index={index}/>
    default:
      return <>Unsupported task type</>
    }
}

export default TaskInputSet