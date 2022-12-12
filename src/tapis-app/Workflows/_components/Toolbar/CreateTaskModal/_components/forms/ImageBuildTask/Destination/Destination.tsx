import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  DockerhubDestination,
  LocalDestination,
} from "."
import { Button, Input } from "reactstrap"
import { FieldWrapper, Icon } from "tapis-ui/_common"
import styles from "./Destination.module.scss"


const DestinationSet: React.FC = () => {
  const [ type, setType ] = useState<string>("")
  
  let DestinationComponent = <></>
  switch (type) {
    case Workflows.EnumDestinationType.Local:
      DestinationComponent = <LocalDestination />
      break;
    case Workflows.EnumDestinationType.Dockerhub:
      DestinationComponent = <DockerhubDestination />
      break;
    default:
      DestinationComponent = <></>
  }
  
  return (
    <div id="destination-input-set">
      <div className={styles["grid-2-auto-auto"]}>
        <FieldWrapper
          label={"destination"}
          required={true}
          description={"Where the image build will be persisted"}
        >
          <Input
            type="select"
            disabled={type !== ""}
            onChange={(e) => setType(e.target.value)}
          >
            <option disabled selected={type === ""} value={""}> -- select an option -- </option>
            {Object.values(Workflows.EnumDestinationType).map((type) => {
              return <option value={type}>{type}</option>
            })}
          </Input>
        </FieldWrapper>
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
      {DestinationComponent}
    </div>
  )
}

export default DestinationSet