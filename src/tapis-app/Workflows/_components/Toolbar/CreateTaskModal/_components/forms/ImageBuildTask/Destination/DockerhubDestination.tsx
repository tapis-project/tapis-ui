import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { useList } from "tapis-hooks/workflows/identities"
import { FormikInput } from "tapis-ui/_common"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { QueryWrapper } from "tapis-ui/_wrappers"
import { Credentials } from "../Credentials"
import styles from "./Destination.module.scss"

const DockerhubDestination: React.FC = () => {
  const { data, isLoading, error } = useList()
  const identities = data?.result ?? []
  const [ identityAsCreds, setIdentityAsCreds ] = useState<boolean>(false)
  const identitiesByType = (type: string) => identities.filter((ident) => ident.type === type)
  const type = "dockerhub"

  return (
    <div id="destination-details">
      <div className={styles["grid-2"]}>
        <FormikInput
          name={`destination.url`}
          label="url"
          required={true}
          description={`URL of the image registry. Follows the format "<user>/<registry_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`destination.tag`}
          label="image tag"
          required={true}
          description={`The version of the image to be pulled`}
          aria-label="Input"
        />
      </div>
      <div id="destination-credentials">
        <h2>Credentials</h2>
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
          <Credentials
            scope="destination"
            type={Workflows.EnumDestinationType.Dockerhub}
          />
        )}
      </div>
      
    </div>
  )
}

export default DockerhubDestination