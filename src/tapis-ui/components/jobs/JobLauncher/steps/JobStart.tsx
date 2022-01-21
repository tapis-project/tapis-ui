import { useCallback } from 'react';
import { Input } from 'reactstrap';
import { FieldWrapper, Message } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useForm } from 'react-hook-form';
import { Jobs, Apps } from '@tapis/tapis-typescript';
import { useJobLauncher } from '../JobLauncherContext';
import { useWizard, WizardNavigation } from 'tapis-ui/_wrappers/Wizard';

type JobStartProps = {
  app: Apps.TapisApp;
};

export const JobStart: React.FC<JobStartProps> = ({ app }) => {
  const { job, add } = useJobLauncher();
  const { nextStep } = useWizard();
  const { register, formState, handleSubmit } = useForm<Jobs.ReqSubmitJob>({
    defaultValues: job,
  });
  const { errors } = formState;

  const formSubmit = useCallback(
    (value: Jobs.ReqSubmitJob) => {
      add(value);
      nextStep && nextStep();
    },
    [nextStep, add]
  );

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
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
          {...mapInnerRef(register('name', { required: 'Name is required' }))}
        />
      </FieldWrapper>
      <WizardNavigation />
    </form>
  );
};

export const JobStartSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { name, appId, appVersion } = job;
  return (
    <div>
      {name ? (
        <div>{name}</div>
      ) : (
        <Message type="error" canDismiss={false} scope="inline">
          A job name is required
        </Message>
      )}
      <div>
        <i>
          Application: {appId} v{appVersion}
        </i>
      </div>
    </div>
  );
};
