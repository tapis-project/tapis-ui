import React, { useState, useContext, useCallback } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { Button } from 'reactstrap';
import { WizardStep } from '.';
import styles from './Wizard.module.scss';

export type WizardContextType = Partial<StepWizardChildProps>;

const WizardContext: React.Context<WizardContextType> =
  React.createContext<WizardContextType>({});

type WizardProps = {
  steps: Array<WizardStep>;
};

export const useWizard = () => {
  const props = useContext(WizardContext);
  return props;
};

type StepContainerProps = {
  step: WizardStep;
} & Partial<StepWizardChildProps>;

const StepContainer: React.FC<StepContainerProps> = ({ step }) => {
  return <div>{step.render}</div>;
};

type WizardControlProps = WizardProps & Partial<StepWizardChildProps>;

const WizardSummary: React.FC<WizardControlProps> = ({
  steps,
  ...stepWizardProps
}) => {
  const { goToNamedStep } = stepWizardProps;
  const editCallback = useCallback(
    (stepId: string) => goToNamedStep && goToNamedStep(stepId),
    [ goToNamedStep ]
  )
  return (
    <div className={styles.summary}>
      {
        steps.map(
          (step) => (
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
              <div className={styles.content}>
                {step.summary}
              </div>
            </div>
          )
        )
      }
    </div>
  );
};

const WizardProgress: React.FC<WizardControlProps> = ({ steps, ...stepWizardProps }) => {
  const { currentStep } = stepWizardProps;
  if (currentStep === undefined) { 
    return null;
  }
  return (
    <div>
      {steps[currentStep - 1].name}
    </div>
  )
}

const Wizard: React.FC<WizardProps> = ({ steps }) => {
  const [stepWizardProps, setStepWizardProps] = useState<
    Partial<StepWizardChildProps>
  >({});

  const instanceCallback = useCallback(
    (props: Partial<StepWizardChildProps>) => {
      setStepWizardProps({
        currentStep: 1,
        totalSteps: steps.length,
        ...props
      })
    },
    [ setStepWizardProps, steps ]
  )

  const stepChangeCallback = useCallback(
    ({ activeStep }: { previousStep: number, activeStep: number }) => {
      setStepWizardProps({
        ...stepWizardProps,
        currentStep: activeStep
      })
    },
    [ setStepWizardProps, stepWizardProps ]
  )

  return (
    <WizardContext.Provider value={stepWizardProps}>
      <div className={styles.container}>
        <StepWizard
          nav={<WizardProgress steps={steps} {...stepWizardProps} />}
          instance={instanceCallback}
          className={styles.steps}
          onStepChange={stepChangeCallback}
          transitions={{}}
        >
          {steps.map((step) => (
            <StepContainer stepName={step.id} step={step} />
          ))}
        </StepWizard>
        <WizardSummary steps={steps} {...stepWizardProps} />
      </div>
    </WizardContext.Provider>
  );
};

export default Wizard;
