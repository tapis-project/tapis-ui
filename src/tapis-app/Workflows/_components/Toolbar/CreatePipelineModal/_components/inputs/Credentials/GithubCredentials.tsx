import React from "react"
import { FormikInput } from "tapis-ui/_common"
import styles from "./Credentials.module.scss"

type GithubCredentialsProps = {
  index: number,
  scope: "context" | "destination"
}

const GithubCredentials: React.FC<GithubCredentialsProps> = ({index, scope}) => {
  return (
    <div id={`${scope}-credentials-details`} className={styles["grid-2"]}>
      <FormikInput
        name={`tasks.${index}.${scope}.credentials.username`}
        label="username"
        required={true}
        description={`Github username`}
        aria-label="Input"
      />
      <FormikInput
        name={`tasks.${index}.${scope}.credentials.personal_access_token`}
        label="personal access token"
        required={true}
        description={`Personal access token`}
        aria-label="Input"
      />
    </div>
  )
}

export default GithubCredentials