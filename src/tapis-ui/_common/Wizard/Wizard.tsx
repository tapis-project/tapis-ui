import React, { useState, useContext } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { WizardStep } from '.';

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

const WizardProgress: React.FC<WizardControlProps> = ({
  steps,
  ...stepWizardProps
}) => {
  const { currentStep } = stepWizardProps;
  return <div>PROGRESS BAR {`${currentStep} of ${steps.length}`}</div>;
};

const Wizard: React.FC<WizardProps> = ({ steps }) => {
  const [stepWizardProps, setStepWizardProps] = useState<
    Partial<StepWizardChildProps>
  >({});

  return (
    <WizardContext.Provider value={stepWizardProps}>
      <StepWizard
        instance={setStepWizardProps}
        nav={<WizardProgress steps={steps} />}
      >
        {steps.map((step) => (
          <StepContainer stepName={step.id} step={step} />
        ))}
      </StepWizard>
    </WizardContext.Provider>
  );
};

export default Wizard;
