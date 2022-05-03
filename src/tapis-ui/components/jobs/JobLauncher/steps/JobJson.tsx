import { useJobLauncher } from '../components';
import { JSONDisplay } from 'tapis-ui/_common';
import { JobStep } from '../';

export const JobJson: React.FC = () => {
  const { job } = useJobLauncher();
  return (
    <div>
      <h2>Job JSON</h2>
      <div>
        This is a preview of the json job submission data. You may copy it for
        future reference.
      </div>
      <JSONDisplay json={job} />
    </div>
  );
};

export const JobJsonSummary: React.FC = () => {
  return null;
};

const step: JobStep = {
  id: 'jobJson',
  name: 'Job JSON',
  render: <JobJson />,
  summary: <JobJsonSummary />,
  validationSchema: {},
  generateInitialValues: () => ({}),
}

export default step;