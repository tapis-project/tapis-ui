import React from "react"
import { FormikInput } from "tapis-ui/_common"
import styles from "./Credentials.module.scss"

type DockerhubCredentialsProps = {
  index: number,
  scope: "context" | "destination"
}

const DockerhubCredentials: React.FC<DockerhubCredentialsProps> = ({index, scope}) => {
  return (
    <div id={`${scope}-credentials-details`} className={styles["grid-2"]}>
      <FormikInput
        name={`tasks.${index}.${scope}.credentials.username`}
        label="username"
        required={true}
        description={`Dockerhub username`}
        aria-label="Input"
      />
      <FormikInput
        name={`tasks.${index}.${scope}.credentials.token`}
        label="access token"
        required={true}
        description={`Access token`}
        aria-label="Input"
      />
    </div>
  )
}

export default DockerhubCredentials