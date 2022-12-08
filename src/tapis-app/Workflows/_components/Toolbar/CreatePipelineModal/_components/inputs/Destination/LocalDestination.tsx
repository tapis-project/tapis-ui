import { Workflows } from "@tapis/tapis-typescript";
import React from "react"
import { FormikInput } from "tapis-ui/_common"
import styles from "./Destination.module.scss"

const LocalDestination: React.FC<{index: number}> = ({index}) => {
  return (
    <div id="Destination-details">
      <div className={styles["grid-2"]}>
        <FormikInput
          name={`tasks.${index}.destination.filename`}
          placeholder={`"my_image.tar.gz" or "my_mage.SIF"`}
          label="filename"
          required={false}
          description={`Name for the image file produced by this task. Will default to the name provided by the image builder if none provided.`}
          aria-label="Input"
        />
      </div>
    </div>
  )
}

export default LocalDestination