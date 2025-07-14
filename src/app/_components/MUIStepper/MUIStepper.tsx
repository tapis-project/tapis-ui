import { useCallback, useMemo, useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { default as StepperStateProvider } from './StepperStateProvider';

export type State = Record<any, any>;

type StepWrapper = {
  label: string;
  element: React.ReactElement;
  nextCondition?: (state: State) => boolean;
};

interface MUIStepperProps {
  steps: Array<StepWrapper>;
  initialState: State;
  onClickFinish?: (state: State) => void;
  finishButtonText?: string;
}

const MUIStepper = ({
  steps,
  initialState,
  onClickFinish,
  finishButtonText,
}: MUIStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [state, setState] = useState<State>(initialState);

  const updateState = useCallback(
    (newState: State) => {
      setState({
        ...state,
        ...newState,
      });
    },
    [state, setState, activeStep, setActiveStep]
  );

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setState(initialState);
    setActiveStep(0);
  };

  const handleFinish = useCallback(() => {
    onClickFinish && onClickFinish(state);
  }, [activeStep, setActiveStep, state, setState]);

  const getStep = useCallback(() => {
    return steps[activeStep];
  }, [activeStep, setActiveStep, state, setState]);

  const resolveNextCondition = useMemo(() => {
    let nextCondition = getStep().nextCondition;
    if (nextCondition !== undefined) {
      return !nextCondition(state);
    }

    return false;
  }, [activeStep, setActiveStep, state, setState]);

  const renderStepper = useCallback(
    () => (
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStep().element}
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            // Pain in the ass. Needed to use an IIFE here to make use of type
            // narrowing; couldn't do it well with a ternary. I mean probably could
            // have put that in a function but that would make this even harder to
            // reason about.
            disabled={resolveNextCondition}
            onClick={
              activeStep !== steps.length - 1 ? handleNext : handleFinish
            }
          >
            {activeStep === steps.length - 1
              ? finishButtonText
                ? finishButtonText
                : 'Finish'
              : 'Next'}
          </Button>
        </Box>
      </Box>
    ),
    [activeStep, setActiveStep, state, setState]
  );

  return (
    <StepperStateProvider state={state} updateState={updateState}>
      {renderStepper()}
    </StepperStateProvider>
  );
};

export default MUIStepper;
