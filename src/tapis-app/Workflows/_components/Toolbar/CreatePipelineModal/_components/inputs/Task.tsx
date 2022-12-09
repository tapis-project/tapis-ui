import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  ImageBuildTask,
  RequestTask,
} from "."

type TaskProps = {
  type: string,
  index: number
}

const Task: React.FC<TaskProps> = ({type, index}) => {
  switch (type) {
    case Workflows.EnumTaskType.ImageBuild:
      return <ImageBuildTask index={index}/>
    case Workflows.EnumTaskType.Request:
      return <RequestTask index={index}/>
    default:
      return <>Unsupported task type</>
    }
}

export default Task