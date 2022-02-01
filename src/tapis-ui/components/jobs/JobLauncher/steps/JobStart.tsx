import { Input } from 'reactstrap';
import { FieldWrapper } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import { Jobs, Apps } from '@tapis/tapis-typescript';

import { useJobBuilder } from 'tapis-hooks/jobs/jobBuilder';
import { StepSummaryField } from '../components';

type JobStartProps = {
  app: Apps.TapisApp;
};

export const JobStart: React.FC<JobStartProps> = ({ app }) => {
  const { job } = useJobBuilder();
  const { register, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  return (
    <div>
      <div>
        <i>
          Launching {app.id} v{app.version}
        </i>
      </div>
      <FieldWrapper
        description="A name for this job"
        label="Name"
        required={true}
        error={errors['name']}
      >
        <Input
          bsSize="sm"
          defaultValue={job.name}
          {...mapInnerRef(register('name', { required: 'Name is required' }))}
        />
      </FieldWrapper>
    </div>
  );
};

export const JobStartSummary: React.FC = () => {
  const { job } = useJobBuilder();
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
