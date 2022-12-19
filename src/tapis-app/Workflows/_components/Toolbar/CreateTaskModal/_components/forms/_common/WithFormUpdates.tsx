import React, { useEffect } from "react"
import { useFormikContext } from "formik"
import { useImageBuildTaskContext } from "../ImageBuildTask/ImageBuildTask"
import { Workflows } from "@tapis/tapis-typescript"

export type State = any

type Before = (state: State) => State
type After = (state: State) => State

type WithFormUpdateProps = React.PropsWithChildren<{}> & {
    update: Before,
    remove: After
  }
  
  const WithFormUpdates: React.FC<WithFormUpdateProps> = ({
    children,
    update,
    remove
  }) => {
      const { context } = useImageBuildTaskContext()
      const { values } = useFormikContext<Partial<Workflows.ReqImageBuildTask>>()
      
      useEffect(() => {
        let state = JSON.parse(JSON.stringify(values)) // Deep copy
        console.log("before", state)
        let modifiedState = update(state)
        console.log("after", modifiedState)
        context.setInitialValues(modifiedState)
        return () => {
          let modifiedState = remove(state)
          context.setInitialValues(modifiedState)
        }
    }, [])
    return (<>{children}</>)
  }

export default WithFormUpdates