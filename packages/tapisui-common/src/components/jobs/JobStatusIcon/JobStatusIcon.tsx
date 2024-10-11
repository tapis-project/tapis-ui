import { Jobs } from '@tapis/tapis-typescript';
import {
  CheckCircleOutline,
  Publish,
  Cancel,
  DoNotDisturb,
  QuestionMark,
  PauseCircle,
  Archive,
  MoveUp,
  Backup,
  BuildCircle,
  HourglassBottom,
  Dangerous,
  RestorePage,
  Autorenew,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import styles from './JobStatusIcon.module.scss';

type Status = Jobs.JobStatusEnum | Jobs.JobListDTOStatusEnum;

type Animation = 'rotate';

const getJobStatusIcon = (status: Status, animation?: Animation) => {
  switch (status) {
    case Jobs.JobStatusEnum.SubmittingJob:
    case Jobs.JobListDTOStatusEnum.SubmittingJob:
      return <Publish style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.Failed:
    case Jobs.JobStatusEnum.Failed:
      return <Cancel color="error" />;
    case Jobs.JobStatusEnum.Paused:
    case Jobs.JobListDTOStatusEnum.Paused:
      return <PauseCircle color="warning" />;
    case Jobs.JobStatusEnum.Queued:
    case Jobs.JobListDTOStatusEnum.Queued:
      return <MoveUp style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.Running:
    case Jobs.JobListDTOStatusEnum.Running:
      return (
        <Autorenew
          style={{ color: '#ffa726' }}
          className={animation ? styles[animation] : ''}
        />
      );
    case Jobs.JobStatusEnum.ProcessingInputs:
    case Jobs.JobListDTOStatusEnum.ProcessingInputs:
      return <RestorePage style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.StagingInputs:
    case Jobs.JobListDTOStatusEnum.StagingInputs:
      return <Backup style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.StagingJob:
    case Jobs.JobListDTOStatusEnum.StagingJob:
      return <BuildCircle style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.Archiving:
    case Jobs.JobListDTOStatusEnum.Archiving:
      return <Archive style={{ color: '#ffa726' }} />;
    case Jobs.JobStatusEnum.Blocked:
    case Jobs.JobListDTOStatusEnum.Blocked:
      return <Dangerous color="warning" />;
    case Jobs.JobStatusEnum.Cancelled:
    case Jobs.JobListDTOStatusEnum.Cancelled:
      return <DoNotDisturb color="disabled" />;
    case Jobs.JobStatusEnum.Finished:
    case Jobs.JobListDTOStatusEnum.Finished:
      return <CheckCircleOutline color="success" />;
    case Jobs.JobStatusEnum.Pending:
    case Jobs.JobListDTOStatusEnum.Pending:
      return <HourglassBottom style={{ color: '#ffa726' }} />;
    default:
      return <QuestionMark color="error" />;
  }
};

const JobStatusIcon: React.FC<{
  status: Status;
  tooltip?: string;
  animation?: Animation;
}> = ({ status, tooltip, animation = undefined }) => {
  return (
    <Tooltip placement="top" title={tooltip ? tooltip : status}>
      {getJobStatusIcon(status, animation)}
    </Tooltip>
  );
};

export default JobStatusIcon;
