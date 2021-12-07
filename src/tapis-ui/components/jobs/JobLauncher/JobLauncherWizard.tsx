import React, { useEffect } from 'react';
import { Wizard, Steps, Step, WithWizard, withWizard, WizardComponentProps, WizardProps } from 'react-albus';
import { Button } from 'reactstrap';


type StepWrapperProps = {

} & WizardComponentProps;

const StepWrapper: React.FC<StepWrapperProps> = ({ wizard }) => {
  console.log("WIZARD PROPS", wizard);
  return (
    <div>Step 1</div>
  )
}

const Navigation: React.FC = () => {
  return (
    <WithWizard
      render={({next, previous, steps, step, history}) => {
        console.log("HISTORY", step, history);
        return (
          <div>
            {steps.indexOf(step) < steps.length - 1 && (
              <Button onClick={next}>Next</Button>
            )}
            {steps.indexOf(step) > 0 && (
              <Button onClick={previous}>Previous</Button>
            )}
          </div>
        )
      }}
    />
  )
}

type ResetterProps = {
  appId: string;
  appVersion: string;
} & WizardComponentProps;

const Resetter: React.FC<ResetterProps> = ({ appId, appVersion, wizard }) => {
  console.log("RESETTING", appId, appVersion)
  useEffect(
    () => {
      console.log("RESET");
      wizard.go(0);
    },
    [ wizard, appId, appVersion ]
  )
  return null;
}

const WizardWrapper = withWizard(StepWrapper);

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
} & WizardProps;

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({ appId, appVersion, history, basename }) => {
  console.log("Wizard", history, basename);
  return (
    <Wizard history={history} basename={basename}>
      <Steps>
        <Step id="step1">
          <h1>Step 1</h1>
        </Step>
        <Step id="step2">
          <h1>Step 2</h1> 
        </Step>
      </Steps>
      <Navigation />
    </Wizard>
  )
}

export default JobLauncherWizard;