import { Workflows } from "@tapis/tapis-typescript"
import { Details } from "../_common"
import { Context, Destination, Builder } from "./"
import styles from "./ImageBuildTask.module.scss"

const ImageBuildTask: React.FC<{index: number}> = ({index}) => {
  return (
    <div id={`task-inputs-${index}`} className={styles["container"]}>
      <p><b>{index + 1}.</b> Image Build Task</p>
      <div>
        <Details index={index} type={Workflows.EnumTaskType.ImageBuild} />
        <Builder index={index} />
      </div>
      <div className={styles["section"]}>
        <h2>Context</h2>
        <Context index={index}/>
      </div>
      <div className={styles["section"]}>
        <h2>Destination</h2>
        <Destination index={index}/>
      </div>
    </div>
  )
}

export default ImageBuildTask