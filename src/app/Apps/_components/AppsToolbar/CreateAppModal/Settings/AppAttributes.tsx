import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import styles from '../CreateAppModal.module.scss';

const AppAttributes: React.FC = () => {
  return (
    <div>
      <h2>Application Attributes</h2>
      <Collapse title="Application Attributes" className={styles['array']}>
        <FormikInput
          name="owner"
          label="Application Owner"
          required={false}
          description={`App Owner`}
          aria-label="Input"
        />
        <FormikCheck
          name="enabled"
          required={false}
          label="Application Enabled?"
          description={
            'Indicates if application currently enabled for use. Default is TRUE.'
          }
        />
        <FormikCheck
          name="locked"
          required={false}
          label="Application Version Locked?"
          description={
            'Indicates if version is currently locked. Locking disallows updates. Default is FALSE'
          }
        />
        <FormikInput
          name="runtimeVersion"
          label="Runtime Version"
          required={false}
          description={`Optional version or range of versions required.`}
          aria-label="Input"
        />
        <FormikInput
          name="maxJobs"
          label="Max Jobs"
          required={false}
          description={`Max number of jobs that can be running for this app on a system. System may also limit the number of jobs. Set to -1 for unlimited. Default is unlimited.`}
          aria-label="Input"
        />
        <FormikInput
          name="maxJobsPerUser"
          label="Max Jobs Per User"
          required={false}
          description={`Max number of jobs per job owner. System may also limit the number of jobs. Set to -1 for unlimited. Default is unlimited.`}
          aria-label="Input"
        />
        <FormikCheck
          name="strictFileInputs"
          required={false}
          label="Strict File Inputs?"
          description={
            'Indicates if a job request is allowed to have unnamed file inputs. If TRUE then a job request may only use named file inputs defined in the app. Default is FALSE.'
          }
        />
      </Collapse>
    </div>
  );
};

export default AppAttributes;
