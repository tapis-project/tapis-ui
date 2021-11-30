import React, { useRef, useEffect } from 'react';
import { Wizard as WizardLibrary, useWizard } from 'react-use-wizard';
import { Button } from 'reactstrap';
import { Icon } from 'tapis-ui/_common';
import { motion } from 'framer-motion';
import { Step } from './index';
import { v4 as uuidv4 } from 'uuid';
import styles from './Wizard.module.scss';

const variants = {
  enter: (direction: number) => {
    let x = 0;
    if (direction < 0) {
      x = 1000;
    }
    if (direction > 0) {
      x = -1000;
    }
    return {
      x,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
};

type WizardProps = {
  steps: Array<Step>;
  onStep?: () => void;
  finish?: React.ReactNode;
  requireComplete?: boolean;
};

const StepWrapper: React.FC<
  React.PropsWithChildren<{
    previousStep: React.MutableRefObject<number>;
  }>
> = ({ children, previousStep }) => {
  const { activeStep } = useWizard();
  useEffect(() => {
    previousStep.current = activeStep;
  }, [activeStep, previousStep]);

  return (
    <motion.div
      custom={activeStep - previousStep.current}
      variants={variants}
      initial="enter"
      animate="center"
    >
      <form>{children}</form>
    </motion.div>
  );
};

const StepHeader: React.FC<WizardProps> = ({
  steps,
  onStep,
  requireComplete,
}) => {
  const { goToStep, activeStep } = useWizard();
  const firstIncomplete = steps.findIndex((step) => !step.complete);
  return (
    <div className={styles.header}>
      {steps.map((step, index) => (
        <div className={styles.step} key={uuidv4()}>
          <Button
            color="link"
            onClick={() => {
              goToStep(index);
              onStep && onStep();
            }}
            className={`${styles['step-name']} ${
              activeStep === index ? styles['active-step'] : ''
            }`}
            disabled={
              requireComplete && firstIncomplete > -1 && index > firstIncomplete
            }
          >
            {`${index + 1}. ${step.name}`}
          </Button>
          {step.complete ? (
            <Icon
              name="approved-reverse"
              className={`${styles['step-icon']} ${styles.complete}`}
            />
          ) : (
            <Icon
              name="approved"
              className={`${styles['step-icon']} ${styles.complete}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const StepFooter: React.FC<WizardProps> = ({
  steps,
  onStep,
  finish,
  requireComplete,
}) => {
  const { nextStep, previousStep, isFirstStep, isLastStep, activeStep } =
    useWizard();
  const currentStep = steps[activeStep];
  return (
    <div className={styles.footer}>
      <div>
        {!isFirstStep && (
          <Button
            color="secondary"
            onClick={() => {
              previousStep();
              onStep && onStep();
            }}
            disabled={isFirstStep}
            className={styles.control}
            data-testid="previous"
          >
            Previous
          </Button>
        )}
      </div>
      <div>
        {!isLastStep && (
          <Button
            color="primary"
            onClick={() => {
              nextStep();
              onStep && onStep();
            }}
            disabled={requireComplete && currentStep && !currentStep.complete}
            data-testid="next"
          >
            Next
          </Button>
        )}
        {isLastStep && finish && <>{finish}</>}
      </div>
    </div>
  );
};

const Wizard: React.FC<WizardProps> = ({ ...props }) => {
  const previousStep = useRef<number>(0);
  const { steps } = props;
  return (
    <WizardLibrary
      header={<StepHeader {...props} />}
      footer={<StepFooter {...props} />}
    >
      {steps.map((step) => (
        <StepWrapper previousStep={previousStep} key={uuidv4()}>
          {step.component}
        </StepWrapper>
      ))}
    </WizardLibrary>
  );
};

export default Wizard;
