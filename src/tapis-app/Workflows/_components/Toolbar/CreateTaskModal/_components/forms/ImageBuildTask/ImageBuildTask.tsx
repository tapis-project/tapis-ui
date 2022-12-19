import React, { useState, useContext } from "react"
import { Workflows } from "@tapis/tapis-typescript"
import { Details } from "../_common"
import { Context, Destination, Builder } from "./"
import { Form, Formik, useFormikContext } from 'formik';
import styles from "./ImageBuildTask.module.scss"
import * as Yup from "yup"

type ImageBuildTaskProps = {
  onSubmit: (
    // Note: Requires the type of initialValues to fully satisfy the type below. 
    // Because the type changes as we modify initial values, we use any
    reqTask: any
  ) => void
}

// Note: Type hack override
type InitialValues = Partial<Omit<Workflows.ReqImageBuildTask, "builder"> & {
  builder: string
}>

type ImageBuildContextType = {
  initialValues: InitialValues,
  setInitialValues: React.Dispatch<any>,
  validationSchema: Partial<Yup.ObjectSchema<any>>,
  setValidationSchema: React.Dispatch<any>
}
export const ImageBuildContext = React.createContext(({} as ImageBuildContextType))

export const useImageBuildTaskContext = () => {
  return { context: useContext(ImageBuildContext) }
}

const WithImageBuildContext: React.FC<ImageBuildTaskProps> = ({onSubmit}) => {
  const defaultInitialValues = {
    id: "",
    description: "",
    type: Workflows.EnumTaskType.ImageBuild,
    builder: "",
    cache: false
  }
  const [ initialValues, setInitialValues ] = useState(defaultInitialValues)
  const [ validationSchema, setValidationSchema ] = useState(Yup.object())

  return (
    <ImageBuildContext.Provider value={{
      initialValues,
      setInitialValues,
      validationSchema,
      setValidationSchema,
    }}>
      <ImageBuildTask onSubmit={onSubmit}/>
    </ImageBuildContext.Provider>
  )
}

const ImageBuildTask: React.FC<ImageBuildTaskProps> = ({onSubmit}) => {
  const { context } = useImageBuildTaskContext()
  // const [ initialValues, setInitialValues ] = useState({
  //   id: "",
  //   description: "",
  //   type: Workflows.EnumTaskType.ImageBuild,
  //   builder: null,
    // context: {
    //   type: "",
      // branch: "",
      // build_file_path: "",
      // sub_path: "",
      // filename: "",
      // visibility: null,
      // url: "",
      // tag: "",
      // credentials: {
        // username: "",
        // personal_access_token: "",
        // access_token: ""
      // }, 
      // identity_uuid: ""
    // },
    // destination: {
    //   type: "",
    //   credentials: {
        // username: "",
        // personal_access_token: "",
        // access_token: ""
      // },
      // filename: "",
      // url: "",
      // tag: "",
    //   identity_uuid: ""
    // }
  // })
  // const validationSchema = Yup.object()
  
  return (
    <div id={`task-form`} className={styles["container"]}>
      <Formik
        initialValues={context.initialValues}
        validationSchema={context.validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form id="newtask-form">
          <p>Image Build Task</p>
          <div>
            <Details type={Workflows.EnumTaskType.ImageBuild} />
            <Builder />
          </div>
          <div className={styles["section"]}>
            <h2>Context</h2>
            <Context />
          </div>
          <div className={styles["section"]}>
            <h2>Destination</h2>
            <Destination />
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default WithImageBuildContext