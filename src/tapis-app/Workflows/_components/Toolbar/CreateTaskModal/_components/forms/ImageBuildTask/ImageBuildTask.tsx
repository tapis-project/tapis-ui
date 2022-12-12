import { Workflows } from "@tapis/tapis-typescript"
import { Details } from "../_common"
import { Context, Destination, Builder } from "./"
import { Form, Formik } from 'formik';
import styles from "./ImageBuildTask.module.scss"
import * as Yup from "yup"

type ImageBuildTaskProps = {
  onSubmit: (
    reqTask: any
  ) => void
}

// const x: Workflows.ReqDestination

const ImageBuildTask: React.FC<ImageBuildTaskProps> = ({onSubmit}) => {
  const initialValues = {
    id: "",
    description: "",
    type: Workflows.EnumTaskType.ImageBuild,
    builder: null,
    context: {
      type: "",
      branch: "",
      build_file_path: "",
      sub_path: "",
      filename: "",
      visibility: "",
      url: "",
      tag: "",
      credentials: {
        username: "",
        personal_access_token: "",
        access_token: ""
      }, 
      identity_uuid: ""
    },
    destination: {
      type: "",
      credentials: {
        username: "",
        personal_access_token: "",
        access_token: ""
      },
      filename: "",
      url: "",
      tag: "",
      identity_uuid: ""
    }
  }
  const validationSchema = Yup.object()
  
  return (
    <div id={`task-form`} className={styles["container"]}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
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

export default ImageBuildTask