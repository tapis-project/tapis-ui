import React from "react"
import { FormikInput } from "tapis-ui/_common"

const RequestTask: React.FC<{index: number}> = ({index}) => {
  return <>
    <p>Request Task</p>
    <FormikInput
      name={`task.${index}.id`}
      label="Task id"
      required={true}
      description={``}
      aria-label="Input"
    />
  </>
}

export default RequestTask