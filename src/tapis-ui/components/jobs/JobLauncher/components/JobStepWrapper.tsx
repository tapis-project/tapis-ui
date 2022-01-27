import { useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobLauncher, add } from 'tapis-hooks/jobs/jobLauncher';
import { useWizard, WizardNavigation } from 'tapis-ui/_wrappers/Wizard';
import { useDispatch } from 'react-redux';

export const withJobStepWrapper = (render: React.ReactNode) => (
  <JobStepWrapper>{render}</JobStepWrapper>
);

const JobStepWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const job = useJobLauncher();
  const dispatch = useDispatch();
  const { nextStep } = useWizard();
  const methods = useForm<Jobs.ReqSubmitJob>({
    defaultValues: job,
  });
  const { handleSubmit, reset } = methods;
  useEffect(
    () => {
      reset(job);
    },
    [ job, reset ]
  )

  const formSubmit = useCallback(
    (value: Jobs.ReqSubmitJob) => {
      dispatch(add(value));
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
