import { Workflows } from "@tapis/tapis-typescript";
import React from "react"
import { FormikInput } from "tapis-ui/_common"
import styles from "./Context.module.scss"
import { VisibilitySelect } from "./VisibilitySelect";

const GithubContext: React.FC<{index: number}> = ({index}) => {
  return (
    <div id="context-details">
      <div className={styles["grid-2"]}>
        <FormikInput
          name={`tasks.${index}.context.url`}
          label="url"
          required={true}
          description={`URL of the Github repository. Follows the format "<user>/<repo_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`tasks.${index}.context.branch`}
          label="branch"
          required={true}
          description={`Git branch`}
          aria-label="Input"
        />
        <FormikInput
          name={`tasks.${index}.context.build_file_path`}
          placeholder={`Ex: "src/Dockerfile"`}
          label="build file path"
          required={true}
          description={`Path the build file in the source code.`}
          aria-label="Input"
        />
        <FormikInput
          name={`tasks.${index}.context.sub_path`}
          placeholder={"Ex. src/"}
          label="sub path"
          required={false}
          description={`Build context path. The directory in the source code to build from.`}
          aria-label="Input"
        />
      </div>
      <VisibilitySelect index={index} type={Workflows.EnumContextType.Github}/>
    </div>
  )
}

export default GithubContext