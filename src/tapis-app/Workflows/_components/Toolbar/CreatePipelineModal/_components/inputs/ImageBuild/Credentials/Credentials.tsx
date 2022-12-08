import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { DockerhubCredentials, GithubCredentials } from "."

type CredentialsProps = {
  index: number,
  scope: "context" | "destination"
  type: Workflows.EnumContextType | Workflows.EnumDestinationType
}

const Credentials: React.FC<CredentialsProps> = ({index, scope, type}) => {
  switch (type) {
    case Workflows.EnumContextType.Dockerhub:
      return <DockerhubCredentials index={index} scope={scope}/>
    case Workflows.EnumContextType.Github:
      return <GithubCredentials index={index} scope={scope}/>
    default:
      return <>Invalid credential type</>
  }
}

export default Credentials