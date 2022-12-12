import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { DockerhubCredentials, GithubCredentials } from "."

type CredentialsProps = {
  scope: "context" | "destination"
  type: Workflows.EnumContextType | Workflows.EnumDestinationType
}

const Credentials: React.FC<CredentialsProps> = ({scope, type}) => {
  switch (type) {
    case Workflows.EnumContextType.Dockerhub:
      return <DockerhubCredentials scope={scope}/>
    case Workflows.EnumContextType.Github:
      return <GithubCredentials scope={scope}/>
    default:
      return <>Invalid credential type</>
  }
}

export default Credentials