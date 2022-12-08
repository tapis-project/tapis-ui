import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript";
import { useList } from "tapis-hooks/workflows/identities"
import { QueryWrapper } from "tapis-ui/_wrappers"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { Credentials } from "../../Credentials"

type VisibilitySelectProps = {
  index: number,
  type: Workflows.EnumContextType
}

const VisibilitySelect: React.FC<VisibilitySelectProps> = ({index, type}) => {
  const { data, isLoading, error } = useList()
  const identities = data?.result ?? []
  const [ visibility, setVisibility ] = useState<string>("")
  const [ identityAsCreds, setIdentityAsCreds ] = useState<boolean>(false)

  return (
    <div id="context-visibility">
      <h2>Visibility & Credentials</h2>
      <FormikSelect
        name={`tasks.${index}.context.visibility`}
        label={"visibility"}
        required={true}
        description={'Note: Private sources require credentials to access'}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option disabled selected={visibility === ""} value={""}>-- select an option --</option>
        {Object.values(Workflows.EnumContextVisibility).map((vis) => {
          return <option selected={vis === visibility} value={vis}>{vis}</option>
        })}
      </FormikSelect>
      {visibility === "private" && (
        <div id="context-credentials">
          {identityAsCreds ? (
            <QueryWrapper isLoading={isLoading} error={error}>
              <FormikSelect
                name={`tasks.${index}.context.identity_uuid`}
                label={"identity"}
                required={true}
                description={'Note: This identity will be used on every run of this pipeline.'}
                disabled={identities.length === 0}
              >
                <option disabled selected={true} value={""}>
                  {identities.length > 0 ? " -- select an option -- " : " -- no identities availalble -- "}
                </option>
                {identities.map((identity) => {
                  return <option value={identity.uuid}>{identity.name}</option>
                })}
              </FormikSelect>
            </QueryWrapper>
          ) : (
            <Credentials index={index} scope="context" type={type}/>
          )}
        </div>
      )}
    </div>
  )
}

export default VisibilitySelect