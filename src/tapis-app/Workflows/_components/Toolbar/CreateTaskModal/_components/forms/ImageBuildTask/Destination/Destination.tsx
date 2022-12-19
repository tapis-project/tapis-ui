import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import {
  DockerhubDestination,
  LocalDestination,
} from "."
import { Button, Input } from "reactstrap"
import { FieldWrapper, Icon } from "tapis-ui/_common"
import styles from "./Destination.module.scss"
import { WithFormUpdates } from "../../_common"

const DestinationSet: React.FC = () => {
  const [ type, setType ] = useState<string>("")
  
  let DestinationComponent = <></>
  switch (type) {
    case Workflows.EnumDestinationType.Local:
      DestinationComponent = (
        <WithFormUpdates
          update={(state) => {
            let newState = {
              ...state,
              destination: {
                filename: "",
                type
              }
            }
            return newState
          }}
          remove={(state) => {
            delete state.destination
            return state
          }}
        >
          <LocalDestination />
        </WithFormUpdates>
      )
      break;
    case Workflows.EnumDestinationType.Dockerhub:
      DestinationComponent = (
        <WithFormUpdates
          update={(state) => {
            // NOTE!!! When setting the destination prop via "state.destination = ...",
            // why does the destination property not show when logging "state" to the console but
            // does show the value of "state.destination" when logging to the console? Does
            // "state.destination" become its own object
            return {
              ...state,
              destination: {
                url: "",
                tag: "",
                type
              }
            }
          }}
          remove={(state) => {
            delete state.destination
            return state
          }}
        >
          <DockerhubDestination />
        </WithFormUpdates>
      )
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
              return <option key={`destination-${type}`} value={type}>{type}</option>
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