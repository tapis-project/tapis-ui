import React, { useState, useEffect, useCallback } from "react"
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
import { useImageBuildTaskContext } from "../ImageBuildTask"
import { useFormikContext } from "formik"

type WithFormUpdateProps = React.PropsWithChildren<{}> & {
  state: object
}

const WithFormUpdates: React.FC<WithFormUpdateProps> = ({
  children,
  state
}) => {
  const { context } = useImageBuildTaskContext()
  const { values } = useFormikContext<Partial<Workflows.ImageBuildTask>>()
  
  useEffect(() => {
    context.setInitialValues({
      ...values,
      context: state
    })
    return () => {
      delete values.context
      context.setInitialValues(values)
    }
  }, [])
  return (<>{children}</>)
}

const Context: React.FC = () => {
  const [ type, setType ] = useState<string>("")
  let ContextComponent = <></>
  switch (type) {
    case Workflows.EnumContextType.Github:
      ContextComponent = (
        <WithFormUpdates state={{
            url: "",
            branch: "",
            build_file_path: "",
            sub_path: "",
            visibility: "",
            type
          }
        }>
          <GithubContext />
        </WithFormUpdates>
      )
      break;
    case Workflows.EnumContextType.Dockerhub:
      ContextComponent = (
        <WithFormUpdates state={{
          url: "",
          image_tag: "",
          type
        }}>
          <DockerhubContext />
        </WithFormUpdates>
      )
      break;
    case Workflows.EnumContextType.Local:
      ContextComponent = <LocalContext />
      break;
    case Workflows.EnumContextType.Gitlab:
      ContextComponent = <GitlabContext />
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
              return <option key={`context-type-${type}`} disabled={!supported.includes(type)} value={type}>{type}</option>
            })}
          </Input>
        </FieldWrapper>
        <FormikInput
          name={`context.type`}
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