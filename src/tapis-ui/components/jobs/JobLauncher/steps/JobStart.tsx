import {
  FormikJobStepWrapper,
  StepSummaryField,
  useJobLauncher,
} from '../components';
import { FormikInput } from 'tapis-ui/_common';
import * as Yup from 'yup';
import { Jobs } from '@tapis/tapis-typescript';

export const JobStart: React.FC = () => {
  const { app } = useJobLauncher();

  return (
    <div>
      <h2>
        Launching {app.id} v{app.version}
      </h2>
      <FormikInput
        name="name"
        required={true}
        label="Name"
        description="A name for this job"
      />
      <FormikInput
        name="description"
        required={false}
        label="Description"
        description="A description of this job"
      />
    </div>
  );
};

export const JobStartSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { name, description, appId, appVersion } = job;
  return (
    <div>
      <StepSummaryField
        field={name}
        error="A job name is required"
        key="job-start-name-summary"
      />
      <StepSummaryField
        field={description}
        key="job-start-description-summary"
      />
      <div>
        <i>
          Application: {appId} v{appVersion}
        </i>
      </div>
    </div>
  );
};
