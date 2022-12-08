import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  ImageBuildTask,
  RequestTask,
} from "./inputs"

type TaskInputSetProps = {
  type: string,
  index: number
}

const TaskInputSet: React.FC<TaskInputSetProps> = ({type, index}) => {
  switch (type) {
    case Workflows.EnumTaskType.ImageBuild:
      return <ImageBuildTask index={index}/>
    case Workflows.EnumTaskType.Request:
      return <RequestTask index={index}/>
    default:
      return <>Unsupported task type</>
    }
}

export default TaskInputSet