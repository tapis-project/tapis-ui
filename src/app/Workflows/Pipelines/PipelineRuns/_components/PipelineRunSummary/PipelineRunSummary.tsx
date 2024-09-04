import { Workflows } from '@tapis/tapis-typescript';
import styles from './PipelineRunSummary.module.scss';

const PipelineRunSummary: React.FC<
  React.PropsWithChildren<{
    status: Workflows.PipelineRun['status'];
  }>
> = ({ status, children }) => {
  return (
    <div className={styles['header']}>
      <div
        className={`${styles['run-status-icon']} ${
          styles[`run-status-icon-${status}`]
        }`}
      >
        <div className={styles['fancy']} />
      </div>
      {children}
    </div>
  );
};

export default PipelineRunSummary;
