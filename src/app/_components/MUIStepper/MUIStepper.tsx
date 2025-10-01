import { useCallback, useMemo, useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { default as StepperStateProvider } from './StepperStateProvider';
import { LoadingButton } from '@mui/lab';

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
  backDisabled?: boolean;
  nextIsLoading?: boolean;
  nextDisabled?: boolean;
}

const MUIStepper = ({
  steps,
  initialState,
  onClickFinish,
  finishButtonText,
  backDisabled = false,
  nextIsLoading = false,
  nextDisabled = false,
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

  const renderNextButton = useCallback(() => {
    return (
      <LoadingButton
        loading={nextIsLoading}
        disabled={resolveNextCondition || nextDisabled}
        onClick={activeStep !== steps.length - 1 ? handleNext : handleFinish}
      >
        {activeStep === steps.length - 1
          ? finishButtonText
            ? finishButtonText
            : 'Finish'
          : 'Next'}
      </LoadingButton>
    );
  }, [
    activeStep,
    setActiveStep,
    handleNext,
    handleFinish,
    resolveNextCondition,
    finishButtonText,
    nextIsLoading,
    nextDisabled,
  ]);

  const renderBackButton = useCallback(() => {
    return (
      <>
        {steps.length > 1 && activeStep > 0 && (
          <Button
            color="inherit"
            disabled={activeStep === 0 || backDisabled}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        )}
      </>
    );
  }, [backDisabled, activeStep, setActiveStep, handleBack]);

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
          {renderBackButton()}
          <Box sx={{ flex: '1 1 auto' }} />
          {renderNextButton()}
        </Box>
      </Box>
    ),
    [activeStep, setActiveStep, state, setState, initialState, steps]
  );

  return (
    <StepperStateProvider state={state} updateState={updateState}>
      {renderStepper()}
    </StepperStateProvider>
  );
};

export default MUIStepper;
