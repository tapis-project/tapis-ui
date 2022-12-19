import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { DockerhubCredentials, GithubCredentials } from "."
import { WithFormUpdates } from "../../_common"

type CredentialsProps = {
  type: Workflows.EnumContextType | Workflows.EnumDestinationType
  scope: "context" | "destination"
}

const Credentials: React.FC<CredentialsProps> = ({
  scope,
  type
}) => {
  switch (type) {
    case Workflows.EnumContextType.Dockerhub:
    case Workflows.EnumDestinationType.Dockerhub:
      return (
        <WithFormUpdates
          update={(state) => {
            return {
              ...state,
              [scope]: {
                ...state[scope],
                "credentials": {
                  username: "",
                  token: "",
                  type
                }
              }
            }
          }}
          remove={(state) => {
            if ( state[scope]?.credentials !== undefined) {
              delete state[scope].credentials
            }

            return state
          }}
        >
          <DockerhubCredentials scope={scope}/>
        </WithFormUpdates>
      )
    case Workflows.EnumContextType.Github:
      return (
        <WithFormUpdates
          update={(state) => {
            state[scope].credentials = {
              username: "",
              personal_access_token: ""
            }
            return state
          }}
          remove={(state) => {
            if ( state[scope]?.credentials !== undefined) {
              delete state[scope].credentials
            }
            return state
          }}
        >
          <GithubCredentials scope={scope}/>
        </WithFormUpdates>
      )
    default:
      return <>Invalid credential type</>
  }
}

export default Credentials