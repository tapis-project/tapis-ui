import {
  FormikJobStepWrapper,
  StepSummaryField,
  useJobLauncher,
} from '../components';
import { FormikInput } from 'tapis-ui/_common';
import * as Yup from 'yup';

export const JobStart: React.FC = () => {
  const { app } = useJobLauncher();

  const validationSchema = Yup.object({
    name: Yup.string().required(),
  });

  return (
    <FormikJobStepWrapper validationSchema={validationSchema}>
      <div>
        <i>
          Launching {app.id} v{app.version}
        </i>
      </div>
      <FormikInput
        name="name"
        required={true}
        label="Name"
        description="A name for this job"
      />
    </FormikJobStepWrapper>
  );
};

export const JobStartSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { name, appId, appVersion } = job;
  return (
    <div>
      <StepSummaryField field={name} error="A job name is required" />
      <div>
        <i>
          Application: {appId} v{appVersion}
        </i>
      </div>
    </div>
  );
};
