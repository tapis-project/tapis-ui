import React, { useState } from 'react';
import StepWizard, { StepWizardChildProps } from 'react-step-wizard';
import { WizardStep } from '.';

type WizardProps = {
  steps: Array<WizardStep>;
}

type StepContainerProps = {
  step: WizardStep;
} & Partial<StepWizardChildProps>;

const StepContainer: React.FC<StepContainerProps> = ({ step, ...stepWizardProps }) => {
  return (
    <div>
      {step.render}
    </div>
  )
}

type WizardControlProps = WizardProps & Partial<StepWizardChildProps>;

const WizardProgress: React.FC<WizardControlProps> = ({ steps, ...stepWizardProps }) => {
  const { currentStep } = stepWizardProps;
  console.log("Current Step", currentStep);
  return (
    <div>
      PROGRESS BAR
    </div>
  )
}

const WizardNavigation: React.FC<WizardControlProps> = ({ steps, ...stepWizardProps }) => {
  const { currentStep, nextStep, previousStep } = stepWizardProps;
  return (
    <div>
      CONTROLS
    </div>
  )
}

const Wizard: React.FC<WizardProps> = ({ steps }) => {
  const [ stepWizardProps, setStepWizardProps ] = useState<Partial<StepWizardChildProps>>();

  
  return (
    <div>
      <WizardProgress steps={steps} {...stepWizardProps} />
      <StepWizard instance={setStepWizardProps}>
        {steps.map((step) => <StepContainer stepName={step.id} step={step} />)}
      </StepWizard>
      <WizardNavigation steps={steps} {...stepWizardProps} />
    </div>
  )
}

export default Wizard;