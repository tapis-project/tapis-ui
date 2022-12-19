import React, { useState, useEffect } from "react"
import { Workflows } from "@tapis/tapis-typescript";
import { useList } from "tapis-hooks/workflows/identities"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { Credentials } from "../../Credentials"
import styles from "./VisibilitySelect.module.scss"
import { useFormikContext } from "formik"
import { useImageBuildTaskContext } from "../../ImageBuildTask"
import { CredentialsSourceSelect } from "../../Credentials"

type VisibilitySelectProps = {
  type: Workflows.EnumContextType
}

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({type}) => {
  const [ visibility, setVisibility ] = useState<string>("")
  const { setFieldValue } = useFormikContext()
  
  const { context } = useImageBuildTaskContext()
  const { values } = useFormikContext<Partial<Workflows.ImageBuildTask>>()
  // useEffect(() => {    
  //   context.setInitialValues({
  //     ...values,
  //     context: {
  //       // credentials: {
  //       //   personal_access_token: "",
  //       //   username: ""
  //       // },
  //       url: "",
  //       branch: "",
  //       build_file_path: "",
  //       sub_path: "",
  //       visibility: "",
  //       // identity_uuid: ""
  //     }
  //   })

  //   return () => {
  //     delete values.context
  //     context.setInitialValues(values)
  //   }
  // }, [])

  

  return (
    <div id="context-visibility">
      <h2>Visibility & Credentials</h2>
      <FormikSelect
        name={`context.visibility`}
        label={"visibility"}
        required={true}
        description={'Note: Private sources require credentials to access'}
        onChange={(e) => {
          setVisibility(e.target.value)
          setFieldValue("context.visibility", e.target.value)
        }}
      >
        <option disabled selected={true} value={""}>-- select an option --</option>
        {Object.values(Workflows.EnumContextVisibility).map((vis) => {
          return <option key={`context-visiblity-${vis}`} selected={visibility === vis} value={vis}>{vis}</option>
        })}
      </FormikSelect>
      {visibility === "private" && (
        <CredentialsSourceSelect scope={"context"} type={type}/>
      )}
    </div>
  )
}

export default VisibilitySelect