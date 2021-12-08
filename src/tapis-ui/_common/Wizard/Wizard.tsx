import React, { useState, useCallback, useContext } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { Button } from 'reactstrap';
import { WizardStep } from '.';

export type WizardContext = Partial<StepWizardChildProps> ;

const WizardContext: React.Context<WizardContext> =
  React.createContext<WizardContext>({});

type WizardProps = {
  steps: Array<WizardStep>;
}

export const useWizard = () => {
  const props = useContext(WizardContext);
  return props;
}

type StepContainerProps = {
  step: WizardStep;
} & Partial<StepWizardChildProps>;

const StepContainer: React.FC<StepContainerProps> = ({ step }) => {
  return (
    <div>
      {step.render}
    </div>
  )
}

type WizardControlProps = WizardProps & Partial<StepWizardChildProps>;

const WizardProgress: React.FC<WizardControlProps> = ({ steps, ...stepWizardProps }) => {
  const { currentStep } = stepWizardProps;
  return (
    <div>
      PROGRESS BAR
    </div>
  )
}

const Wizard: React.FC<WizardProps> = ({ steps }) => {
  const [ stepWizardProps, setStepWizardProps ] = useState<Partial<StepWizardChildProps>>({});

  return (
    <WizardContext.Provider value={stepWizardProps}>
      <StepWizard instance={setStepWizardProps} nav={<WizardProgress steps={steps} />}>
        {steps.map((step) => <StepContainer stepName={step.id} step={step} />)}
      </StepWizard>
    </WizardContext.Provider>
  )
}

export default Wizard;