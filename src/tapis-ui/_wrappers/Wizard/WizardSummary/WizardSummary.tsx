import { useCallback } from 'react';
import { WizardStep } from '../';
import { StepWizardChildProps } from 'react-step-wizard';
import { Button } from 'reactstrap';
import styles from './WizardSummary.module.scss';

type WizardControlProps = {
  steps: Array<WizardStep>;
  renderSubmit?: React.ReactNode;
} & Partial<StepWizardChildProps>;

function WizardSummary({
  steps,
  renderSubmit,
  ...stepWizardProps
}: WizardControlProps) {
  const { goToNamedStep } = stepWizardProps;
  const editCallback = useCallback(
    (stepId: string) => goToNamedStep && goToNamedStep(stepId),
    [goToNamedStep]
  );
  return (
    <div className={styles.summary}>
      {renderSubmit && <div className={styles.submit}>{renderSubmit}</div>}
      {steps.map((step) => {
        return (
          <div className={styles['step-summary']} key={step.id}>
            <div className={styles.name}>
              <div>
                <b>{step.name}</b>
              </div>
              <Button
                color="link"
                onClick={() => editCallback(step.id)}
                className={styles.edit}
              >
                edit
              </Button>
            </div>
            <div className={styles.content}>{step.summary}</div>
          </div>
        );
      })}
    </div>
  );
}

export default WizardSummary;
