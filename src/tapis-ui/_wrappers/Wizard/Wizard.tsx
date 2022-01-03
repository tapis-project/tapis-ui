import React, { useState, useContext, useCallback } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
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

  return (
    <div className={styles.summary}>
      {
        steps.map(
          (step) => (
            <div>
              <h4>{step.name}</h4>
              <div>
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
  return (
    <div>
      Step {currentStep} of {steps.length}
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
        ...props
      })
    },
    [ setStepWizardProps, stepWizardProps ]
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
