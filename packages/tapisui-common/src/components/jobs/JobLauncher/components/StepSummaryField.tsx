import { Message } from '../../../../ui';

type JobStartSummaryProps = {
  field?: string;
  error?: string;
};

const JobStartSummary: React.FC<JobStartSummaryProps> = ({ field, error }) => {
  return (
    <div>
      {field ? (
        <div>{field}</div>
      ) : (
        <Message type="error" canDismiss={false} scope="inline">
          {error ?? ''}
        </Message>
      )}
    </div>
  );
};

export default JobStartSummary;
