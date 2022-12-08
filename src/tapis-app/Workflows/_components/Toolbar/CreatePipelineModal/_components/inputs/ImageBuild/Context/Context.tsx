import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  GithubContext,
  DockerhubContext,
  LocalContext,
  GitlabContext
} from "."
import { Button, Input } from "reactstrap"
import { FieldWrapper, FormikInput, Icon } from "tapis-ui/_common"
import styles from "./Context.module.scss"

type ContextProps = {
  index: number
}

const Context: React.FC<ContextProps> = ({index}) => {
  const [ type, setType ] = useState<string>("")
  
  let ContextComponent = <></>
  switch (type) {
    case Workflows.EnumContextType.Github:
      ContextComponent = <GithubContext index={index}/>
      break;
    case Workflows.EnumContextType.Dockerhub:
      ContextComponent = <DockerhubContext index={index}/>
      break;
    case Workflows.EnumContextType.Local:
      ContextComponent = <LocalContext index={index}/>
      break;
    case Workflows.EnumContextType.Gitlab:
      ContextComponent = <GitlabContext index={index}/>
      break;
    default:
      ContextComponent = <></>
  }

  return (
    <div id="context-input-set">
      <div className={styles["grid-2-auto-auto"]}>
        <FieldWrapper
          label={"source"}
          required={true}
          description={"The source of the image build"}
        >
          <Input
            type="select"
            disabled={type !== ""}
            onChange={(e) => setType(e.target.value)}
          >
            <option disabled selected={type === ""} value={""}> -- select an option -- </option>
            {Object.values(Workflows.EnumContextType).map((type) => {
              // TODO Remove when all supported
              const supported = [ "github", "dockerhub" ]
              return <option disabled={!supported.includes(type)} value={type}>{type}</option>
            })}
          </Input>
        </FieldWrapper>
        <FormikInput
          name={`tasks.${index}.context.type`}
          value={type}
          label=""
          required={true}
          description={``}
          type="hidden"
          aria-label="Input"
        />
        {type && (
          <Button
            type="button"
            color="danger"
            className={styles["button"]}
            onClick={() => type && setType("")}>
              <Icon name="trash"/> remove
          </Button>
        )}
      </div>
      {ContextComponent}
    </div>
  )
}

export default Context