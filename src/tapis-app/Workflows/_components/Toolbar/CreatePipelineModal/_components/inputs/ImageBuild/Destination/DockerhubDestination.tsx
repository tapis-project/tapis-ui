import { Workflows } from "@tapis/tapis-typescript"
import React from "react"
import { FormikInput } from "tapis-ui/_common"
import { Credentials } from "../Credentials"
import styles from "./Destination.module.scss"

const DockerhubDestination: React.FC<{index: number}> = ({index}) => {
  return (
    <div id="Destination-details">
      <div className={styles["grid-2"]}>
        <FormikInput
          name={`tasks.${index}.destination.url`}
          label="url"
          required={true}
          description={`URL of the image registry. Follows the format "<user>/<registry_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`tasks.${index}.destination.tag`}
          label="image tag"
          required={true}
          description={`The version of the image to be pulled`}
          aria-label="Input"
        />
        <Credentials
            scope="destination"
            type={Workflows.EnumDestinationType.Dockerhub}
            index={index}
        />
      </div>
    </div>
  )
}

export default DockerhubDestination