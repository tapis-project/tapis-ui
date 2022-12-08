import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { Details } from "../_common"
import styles from "../../Task.module.scss"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikInput } from "tapis-ui/_common";

const RequestTask: React.FC<{index: number}> = ({index}) => {
  return (
    <div id={`request-task-${index}`}>
      <p><b>{index + 1}.</b> Request Task</p>
      <Details index={index} type={Workflows.EnumTaskType.Request}/>
      <FormikSelect
        name={`tasks.${index}.method`}
        label={"http method"}
        required={true}
        description={"GET, POST, PUT, PATCH, DELETE"}
      >
        <option disabled selected={true} value={""}>-- select an option --</option>
        {Object.values(Workflows.EnumHTTPMethod).map((method) => {
          // TODO Remove when supported
          const supported = ["get"]
          return <option disabled={!supported.includes(method)} value={method}>{method.toString().toUpperCase()}</option>
        })}
      </FormikSelect>
      <FormikInput
        name={`tasks.${index}.context.url`}
        label="url"
        required={true}
        description={`URL(without query string) to which to send the request.`}
        aria-label="Input"
      />
    </div>
  )
}

export default RequestTask