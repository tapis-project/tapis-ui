import React, { useState, useContext, useCallback, useEffect } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { Button } from 'reactstrap';
import { WizardStep } from '.';
import styles from './Wizard.module.scss';

export type WizardContextType = Partial<StepWizardChildProps>;

const WizardContext: React.Context<WizardContextType> =
  React.createContext<WizardContextType>({});

type WizardProps = {
  steps: Array<WizardStep>;
  memo?: any;
  renderSubmit?: React.ReactNode;
};

export const useWizard = () => {
  const props = useContext(WizardContext);
  return props;
};

export const WizardNavigation: React.FC = () => {
  const { currentStep, previousStep, totalSteps } = useWizard();
  return (
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
  );
};

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
};

type StepContainerProps = {
  step: WizardStep;
} & Partial<StepWizardChildProps>;

const StepContainer: React.FC<StepContainerProps> = ({ step }) => {
  return <div className={styles.step}>{step.render}</div>;
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

function Wizard({ steps, memo, renderSubmit }: WizardProps) {
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
            <StepContainer
              step={step}
              key={`wizard-step-${step.id}`}
              stepName={step.id}
            >
              {step.render}
            </StepContainer>
          ))}
        </StepWizard>
        <WizardSummary
          steps={steps}
          {...stepWizardProps}
          renderSubmit={renderSubmit}
        />
      </div>
    </WizardContext.Provider>
  );
}

export default Wizard;
