import { Workflows } from "@tapis/tapis-typescript";
import React from "react"
import { FormikInput } from "tapis-ui/_common"
import styles from "./Context.module.scss"
import { VisibilitySelect } from "./VisibilitySelect";

const DockerhubContext: React.FC<{index: number}> = ({index}) => {
  return (
    <div id="context-details">
      <div className={styles["grid-2"]}>
        <FormikInput
          name={`tasks.${index}.context.url`}
          label="url"
          required={true}
          description={`URL of the image registry. Follows the format "<user>/<registry_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`tasks.${index}.context.tag`}
          label="image tag"
          required={true}
          description={`The version of the image to be pulled`}
          aria-label="Input"
        />
      </div>
      <VisibilitySelect index={index} type={Workflows.EnumContextType.Dockerhub}/>
    </div>
  )
}

export default DockerhubContext