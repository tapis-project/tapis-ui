import { useState, useEffect } from 'react';
import { Input } from 'reactstrap';
import { FieldWrapper } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import { Jobs, Apps } from '@tapis/tapis-typescript';
import { useJobLauncher } from '../components';
import { StepSummaryField } from '../components';

export const JobStart: React.FC = () => {
  const { register, formState, reset } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  const { job, app } = useJobLauncher();
  const [ defaultName, setDefaultName ] = useState(job.name);
  useEffect(
    () => {
      setDefaultName(job.name);
      reset({ name: job.name });
    },
    [ job.appId, job.appVersion ]
  )
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
          defaultValue={defaultName ?? ''}
          {...mapInnerRef(register('name', { required: 'Name is required' }))}
        />
      </FieldWrapper>
    </div>
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
