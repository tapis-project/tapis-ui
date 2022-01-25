import { useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Jobs } from '@tapis/tapis-typescript';
import useJobLauncher from 'tapis-hooks/jobs/useJobLauncher';
import { useWizard, WizardNavigation } from 'tapis-ui/_wrappers/Wizard';

export const withJobStepWrapper = (render: React.ReactNode) => (
  <JobStepWrapper>{render}</JobStepWrapper>
);

const JobStepWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { job, add } = useJobLauncher();
  const { nextStep } = useWizard();
  const methods = useForm<Jobs.ReqSubmitJob>({
    defaultValues: job,
  });
  const { handleSubmit } = methods;

  const formSubmit = useCallback(
    (value: Jobs.ReqSubmitJob) => {
      add(value);
      nextStep && nextStep();
    },
    [nextStep, add]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(formSubmit)}>
        {children}
        <WizardNavigation />
      </form>
    </FormProvider>
  );
};

export default JobStepWrapper;
