import { Workflows } from '@tapis/tapis-typescript';
import styles from './PipelineRunLogs.module.scss';

const PipelineRunLogs: React.FC<{ logs: Workflows.PipelineRun['logs'] }> = ({
  logs,
}) => {
  return logs ? (
    <pre className={styles['logs']}>{logs}</pre>
  ) : (
    <pre className={styles['logs']}>No logs</pre>
  );
};

export default PipelineRunLogs;
