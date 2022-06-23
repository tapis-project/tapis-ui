import React, { useState, useContext, useCallback, useEffect } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { Button } from 'reactstrap';
import { WizardStep } from '.';
import { Formik, Form, useFormikContext } from 'formik';
import styles from './Wizard.module.scss';

export type WizardContextType = Partial<StepWizardChildProps>;

const WizardContext: React.Context<WizardContextType> =
  React.createContext<WizardContextType>({});

export const useWizard = () => {
  const props = useContext(WizardContext);
  return props;
};

export const WizardNavigation: React.FC = () => {
  const { currentStep, previousStep, totalSteps, nextStep, goToStep } =
    useWizard();
  const { validateForm, handleSubmit } = useFormikContext();
  const onContinue = useCallback(async () => {
    try {
      const errors = await validateForm();
      if (!Object.keys(errors).length) {
        handleSubmit && handleSubmit();
        nextStep && nextStep();
      }
    } catch {}
  }, [validateForm, nextStep, handleSubmit]);
  const onSkip = useCallback(async () => {
    try {
      const errors = await validateForm();
      if (!Object.keys(errors).length && goToStep && !!totalSteps) {
        // Skip to End button doesn't appear to trigger handleSubmit,
        // so it must be called explicitly
        handleSubmit();
        goToStep(totalSteps);
      }
    } catch {}
  }, [validateForm, handleSubmit, goToStep, totalSteps]);
  return (
    <div className={styles.controls}>
      {!!currentStep && currentStep > 1 && (
        <Button onClick={previousStep}>Back</Button>
      )}
      {!!currentStep && !!totalSteps && currentStep < totalSteps && (
        <>
          <Button type="submit" color="primary" onClick={onContinue}>
            Continue
          </Button>
          <Button type="submit" color="secondary" onClick={onSkip}>
            Skip to End
          </Button>
        </>
      )}
    </div>
  );
};

type WizardControlProps<T> = {
  steps: Array<WizardStep<T>>;
} & Partial<StepWizardChildProps>;

function WizardSummary<T>({
  steps,
  ...stepWizardProps
}: WizardControlProps<T>) {
  const { goToNamedStep } = stepWizardProps;
  const editCallback = useCallback(
    (stepId: string) => goToNamedStep && goToNamedStep(stepId),
    [goToNamedStep]
  );
  return (
    <div className={styles.summary}>
      <h3>Summary</h3>
      {steps.map((step) => (
        <div
          className={styles['step-summary']}
          key={`wizard-summary-${step.id}`}
        >
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
}

type StepContainerProps<T> = {
  step: WizardStep<T>;
  formSubmit: (values: Partial<T>) => void;
} & Partial<StepWizardChildProps>;

function StepContainer<T>({ step, formSubmit }: StepContainerProps<T>) {
  const { validationSchema, initialValues, validate } = step;
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={initialValues}
      validate={validate}
      onSubmit={formSubmit}
      enableReinitialize={true}
    >
      <Form>
        <div className={styles.step}>
          {step.render}
          <WizardNavigation />
        </div>
      </Form>
    </Formik>
  );
}

type WizardProps<T> = {
  steps: Array<WizardStep<T>>;
  memo?: any;
  formSubmit: (values: Partial<T>) => void;
};

function Wizard<T>({ steps, memo, formSubmit }: WizardProps<T>) {
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

  useEffect(
    () => {
      goToStep && goToStep(1);
    },
    /* eslint-disable-next-line */
    [memo]
  );

  return (
    <WizardContext.Provider value={stepWizardProps}>
      <div className={styles.container}>
        <StepWizard
          instance={instanceCallback}
          className={styles.steps}
          onStepChange={stepChangeCallback}
          transitions={{}}
        >
          {steps.map((step) => (
            <StepContainer<T>
              step={step}
              key={`wizard-step-${step.id}`}
              stepName={step.id}
              formSubmit={formSubmit}
            />
          ))}
        </StepWizard>
        <WizardSummary steps={steps} {...stepWizardProps} />
      </div>
    </WizardContext.Provider>
  );
}

export default Wizard;
