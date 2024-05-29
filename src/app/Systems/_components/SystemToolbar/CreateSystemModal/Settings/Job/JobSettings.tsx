import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import JobEnvVariablesSettings from './JobEnvVariableSettings';
import JobCapabilitiesSettings from './JobCapabilitiesSettings';

const JobSettings: React.FC = () => {
  return (
    <Collapse title="Job Settings" className={styles['array']}>
      <FormikInput
        name="jobWorkingDir"
        label="Job Working Directory"
        required={false}
        description={`Job working directory`}
        aria-label="Input"
      />
      <FormikInput
        name="jobMaxJobs"
        label="Job Max Jobs"
        type="number"
        required={false}
        description={`Job max jobs`}
        aria-label="Input"
      />
      <FormikInput
        name="jobMaxJobsPerUser"
        label="Job Max Jobs Per User"
        type="number"
        required={false}
        description={`Job max jobs per user`}
        aria-label="Input"
      />
      <JobEnvVariablesSettings />
      <JobCapabilitiesSettings />
    </Collapse>
  );
};

export default JobSettings;
