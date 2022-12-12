import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript";
import { useList } from "tapis-hooks/workflows/identities"
import { QueryWrapper } from "tapis-ui/_wrappers"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { Credentials } from "../../Credentials"
import styles from "./VisibilitySelect.module.scss"

type VisibilitySelectProps = {
  type: Workflows.EnumContextType
}

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({type}) => {
  const { data, isLoading, error } = useList()
  const identities = data?.result ?? []
  const [ visibility, setVisibility ] = useState<string>("")
  const [ identityAsCreds, setIdentityAsCreds ] = useState<boolean>(false)

  const identitiesByType = (type: string) => identities.filter((ident) => ident.type === type)

  return (
    <div id="context-visibility">
      <h2>Visibility & Credentials</h2>
      <FormikSelect
        name={`context.visibility`}
        label={"visibility"}
        required={true}
        description={'Note: Private sources require credentials to access'}
        onChange={(e) => {setVisibility(e.target.value)}}
      >
        <option disabled selected={true} value={""}>-- select an option --</option>
        {Object.values(Workflows.EnumContextVisibility).map((vis) => {
          return <option selected={visibility === vis} value={vis}>{vis}</option>
        })}
      </FormikSelect>
      {visibility === "private" && (
        <div id="context-credentials">
          <div className={styles["radio-button-container"]}>
            <label>
              <input
                type="radio"
                checked={!identityAsCreds}
                onClick={() => {setIdentityAsCreds(!identityAsCreds)}}
              /> Provide credentials
            </label>
          </div>
          <div className={styles["radio-button-container"]}>
            <label>
              <input
                type="radio"
                checked={identityAsCreds}
                onClick={() => {setIdentityAsCreds(!identityAsCreds)}}
              /> Use an external identity
            </label>
          </div>
          {identityAsCreds ? (
            <QueryWrapper isLoading={isLoading} error={error}>
              <FormikSelect
                name={`context.identity_uuid`}
                label={"identity"}
                required={true}
                description={'Note: This identity will be used on every run of this pipeline.'}
                disabled={identitiesByType(type).length === 0}
              >
                <option disabled selected={true} value={""}>
                  {identitiesByType(type).length > 0 ? " -- select an option -- " : ` -- no ${type} identities found -- `}
                </option>
                {identitiesByType(type).map((identity) => {
                  return <option value={identity.uuid}>{identity.name}</option>
                })}
              </FormikSelect>
            </QueryWrapper>
          ) : (
            <Credentials scope="context" type={type}/>
          )}
        </div>
      )}
    </div>
  )
}

export default VisibilitySelect