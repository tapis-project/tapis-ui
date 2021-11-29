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
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
};

const StepWrapper: React.FC<React.PropsWithChildren<{
  previousStep: React.MutableRefObject<number>;
}>> = ({
  children,
  previousStep
}) => {
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
      <form>
        {children}
      </form>
    </motion.div>
  );
};

const StepHeader: React.FC<{
  steps: Array<Step>
}> = ({ steps }) => {
  const { goToStep, activeStep } = useWizard();
  return (
    <div className={styles.header}>
      {steps.map(
        (step, index) => (
          <div className={styles.step} key={uuidv4()}>
            <Button 
              color="link" 
              onClick={() => goToStep(index)} 
              className={`${styles['step-name']} ${activeStep === index ? styles['active-step'] : ''}`}>
              {`${index + 1}. ${step.name}`}
            </Button>
            {
              step.complete
                ? <Icon name="approved-reverse" className={`${styles['step-icon']} ${styles.complete}`} />
                : <Icon name="approved" className={`${styles['step-icon']} ${styles.complete}`} />
            }
          </div>

        )
      )}
    </div>
  )
}

const StepFooter: React.FC = () => {
  const { nextStep, previousStep, isFirstStep, isLastStep } = useWizard();
  return (
    <div>
      <Button 
        color="primary" 
        onClick={previousStep} 
        disabled={isFirstStep}
        className={styles.control}
        data-testid="previous">
        Previous
      </Button>
      <Button 
        type="submit"
        color="secondary"
        onClick={nextStep}
        disabled={isLastStep}
        data-testid="next">
        Next
      </Button>
    </div>
  )
}

const Wizard: React.FC<{steps: Array<Step>}> = ({ steps }) => {
  const previousStep = useRef<number>(0);

  return (
    <WizardLibrary header={<StepHeader steps={steps} />} footer={<StepFooter />}>
      {steps.map(
        (step, index) => (
          <StepWrapper previousStep={previousStep} key={uuidv4()}>
            {step.component}
          </StepWrapper>
        )
      )}
    </WizardLibrary>
  )
}

export default Wizard;