import { FormikInput } from "tapis-ui/_common"
import { Context, Destination, BuilderInputs } from "."
import styles from "./ImageBuildTask.module.scss"

const ImageBuildTaskInputs: React.FC<{index: number}> = ({index}) => {
  return <div id={`task-inputs-${index}`} className={styles["container"]}>
    <p><b>{index + 1}.</b> Image Build Task</p>
    <div>
      <FormikInput
        name={`tasks.${index}.id`}
        label="task id"
        required={true}
        description={``}
        aria-label="Input"
        value=""
      />
      <FormikInput
        name={`tasks.${index}.type`}
        label="type"
        required={true}
        description=""
        aria-label="Input"
        type="hidden"
        value="image_build"
      />
    </div>
    <BuilderInputs index={index} />
    <div className={styles["section"]}>
      <h2>Context</h2>
      <Context index={index}/>
    </div>
    <div className={styles["section"]}>
      <h2>Destination</h2>
      <Destination index={index}/>
    </div>
  </div>
}

export default ImageBuildTaskInputs