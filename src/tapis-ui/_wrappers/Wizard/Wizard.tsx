import React, { useState, useContext, useCallback, useEffect } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import {
  useForm,
  useFormContext,
  FormProvider,
  SubmitHandler,
  UnpackNestedValue,
  DeepPartial,
} from 'react-hook-form';
import { Button } from 'reactstrap';
import { WizardStep } from '.';
import styles from './Wizard.module.scss';

export type WizardContextType = Partial<StepWizardChildProps>;

const WizardContext: React.Context<WizardContextType> =
  React.createContext<WizardContextType>({});

type WizardProps<T> = {
  steps: Array<WizardStep>;
  memo?: Array<any>;
  defaultValues?: Partial<T>;
  renderSubmit?: React.ReactNode;
};

export const useWizard = () => {
  const props = useContext(WizardContext);
  return props;
};

type StepContainerProps = {
  step: WizardStep;
} & Partial<StepWizardChildProps>;

function StepContainer<T>(props: StepContainerProps) {
  const { handleSubmit } = useFormContext<T>();
  const { nextStep, currentStep, previousStep, totalSteps, step } = props;
  const formSubmit: SubmitHandler<T> = () => {
    nextStep && nextStep();
  };
  return (
    <form onSubmit={handleSubmit<T>(formSubmit)} key={step.id}>
      <div className={styles.step}>{step.render}</div>
      <div className={styles.controls}>
        {!!currentStep && currentStep > 1 && (
          <Button onClick={previousStep}>Back</Button>
        )}
        {!!currentStep && !!totalSteps && currentStep < totalSteps && (
          <Button type="submit" color="primary">
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}

type WizardControlProps = {
  steps: Array<WizardStep>;
  renderSubmit?: React.ReactNode;
} & Partial<StepWizardChildProps>;

const WizardSummary: React.FC<WizardControlProps> = ({
  steps,
  renderSubmit,
  ...stepWizardProps
}) => {
  const { goToNamedStep } = stepWizardProps;
  const editCallback = useCallback(
    (stepId: string) => goToNamedStep && goToNamedStep(stepId),
    [goToNamedStep]
  );
  return (
    <div className={styles.summary}>
      {!!renderSubmit && <div className={styles.submit}>{renderSubmit}</div>}
      {steps.map((step) => (
        <div className={styles['step-summary']}>
          <div className={styles.name}>
            <b>{step.name}</b>
            <Button
              color="link"
              onClick={() => editCallback(step.id)}
              className={styles.edit}
            >
              edit
            </Button>
          </div>
          <div className={styles.content}>{step.summary}</div>
        </div>
      ))}
    </div>
  );
};

/* eslint-disable-next-line */
const WizardProgress: React.FC<WizardControlProps> = ({
  steps,
  ...stepWizardProps
}) => {
  const { currentStep } = stepWizardProps;
  if (currentStep === undefined) {
    return null;
  }
  return <div>{steps[currentStep - 1].name}</div>;
};

function Wizard<T>({
  steps,
  memo,
  defaultValues,
  renderSubmit,
}: WizardProps<T>) {
  const methods = useForm<T>();

  const [stepWizardProps, setStepWizardProps] = useState<
    Partial<StepWizardChildProps>
  >({});

  const instanceCallback = useCallback(
    (props: Partial<StepWizardChildProps>) => {
      setStepWizardProps({
        currentStep: 1,
        totalSteps: steps.length,
        ...props,
      });
    },
    [setStepWizardProps, steps]
  );

  const stepChangeCallback = useCallback(
    ({ activeStep }: { previousStep: number; activeStep: number }) => {
      setStepWizardProps({
        ...stepWizardProps,
        currentStep: activeStep,
      });
    },
    [setStepWizardProps, stepWizardProps]
  );

  const { goToStep } = stepWizardProps;
  const { reset } = methods;

  useEffect(
    () => {
      const resetValue: UnpackNestedValue<DeepPartial<T>> =
        (defaultValues as UnpackNestedValue<DeepPartial<T>>) ??
        ({} as UnpackNestedValue<DeepPartial<T>>);
      reset && reset(resetValue);
      goToStep && goToStep(1);
    },
    /* eslint-disable-next-line */
    [memo]
  );

  return (
    <FormProvider {...methods}>
      <WizardContext.Provider value={stepWizardProps}>
        <div className={styles.container}>
          <StepWizard
            instance={instanceCallback}
            className={styles.steps}
            onStepChange={stepChangeCallback}
            transitions={{}}
          >
            {steps.map((step) => (
              <StepContainer stepName={step.id} step={step} />
            ))}
          </StepWizard>
          <WizardSummary
            steps={steps}
            {...stepWizardProps}
            renderSubmit={renderSubmit}
          />
        </div>
      </WizardContext.Provider>
    </FormProvider>
  );
}

export default React.memo(Wizard) as typeof Wizard;
