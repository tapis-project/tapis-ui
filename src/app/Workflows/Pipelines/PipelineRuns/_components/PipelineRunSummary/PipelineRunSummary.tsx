import { Workflows } from '@tapis/tapis-typescript';
import styles from './PipelineRunSummary.module.scss';
import {
  Publish,
  DoNotDisturb,
  Archive,
  Cancel,
  PauseCircle,
  Autorenew,
  CheckCircleOutline,
  Backup,
  HourglassBottom,
  QuestionMark,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';

const PipelineRunSummary: React.FC<
  React.PropsWithChildren<{
    status: Workflows.PipelineRun['status'];
  }>
> = ({ status, children }) => {
  const resolveIcon = (status: Workflows.PipelineRun['status']) => {
    switch (status) {
      case Workflows.EnumRunStatus.Submitted:
        return <Publish style={{ color: '#ffa726' }} />;
      case Workflows.EnumRunStatus.Failed:
        return <Cancel color="error" />;
      case Workflows.EnumRunStatus.Suspended:
        return <PauseCircle color="warning" />;
      case Workflows.EnumRunStatus.Active:
        return (
          <Autorenew
            style={{ color: '#ffa726' }}
            className={styles['rotate']}
          />
        );
      case Workflows.EnumRunStatus.Staging:
        return <Backup style={{ color: '#ffa726' }} />;
      case Workflows.EnumRunStatus.Archiving:
        return <Archive style={{ color: '#ffa726' }} />;
      case Workflows.EnumRunStatus.Terminated:
      case Workflows.EnumRunStatus.Terminating:
        return <DoNotDisturb color="disabled" />;
      case Workflows.EnumRunStatus.Completed:
        return <CheckCircleOutline color="success" />;
      case Workflows.EnumRunStatus.Pending:
        return <HourglassBottom style={{ color: '#ffa726' }} />;
      default:
        return <QuestionMark color="error" />;
    }
  };
  return (
    <div className={styles['header']}>
      <div>
        <Tooltip title={status}>{resolveIcon(status)}</Tooltip>
      </div>
      {children}
    </div>
  );
};

export default PipelineRunSummary;
