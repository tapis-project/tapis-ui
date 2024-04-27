import { Workflows } from "@tapis/tapis-typescript"
import styles from './Node.module.scss';

type NodeTask = Workflows.Task & {}

const Node: React.FC<{ task: NodeTask }> = ({ task }) => {
    return (
        <div className={styles["node"]}>
            <div className={styles["node-name"]}>
                {task.id}
            </div>
            <div className={`${styles["right-anchor"]} ${styles["node-anchor"]}`}/>
            <div className={`${styles["left-anchor"]} ${styles["node-anchor"]}`}/>
        </div>
    );
};

export default Node