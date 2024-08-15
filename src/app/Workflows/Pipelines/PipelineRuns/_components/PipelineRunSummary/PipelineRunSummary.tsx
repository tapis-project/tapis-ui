import { Workflows } from "@tapis/tapis-typescript";
import styles from "./PipelineRunSummary.module.scss"

const PipelineRunSummary: React.FC<{
  status: Workflows.PipelineRun['status'];
  text: string | undefined;
}> = ({ status, text = '' }) => {
  return (
    <div className={styles['header']}>
      <div
        className={`${styles['run-status-icon']} ${
          styles[`run-status-icon-${status}`]
        }`}
      />
      <div className={styles['run-status-text']}>{text}</div>
    </div>
  );
};

export default PipelineRunSummary