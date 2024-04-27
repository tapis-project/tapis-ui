import { Workflows } from "@tapis/tapis-typescript"
import styles from "./PipelineDAGView.module.scss"
import { Node } from "."

const PipelineDAGView: React.FC<{ tasks: Array<Workflows.Task> }> = ({ tasks }) => {
  return (
    <div className={styles["pipeline-dag"]}>
      {
        tasks.map((task: Workflows.Task) => {
          return <Node task={task} />
        })
      }
    </div>
  );
};

export default PipelineDAGView