import { useCallback } from 'react';
import { Formik, Form } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobLauncher } from '.';
import { useWizard, WizardNavigation } from 'tapis-ui/_wrappers/Wizard';

type FormikJobStepWrapperProps = {
  validationSchema: any;
  initialValues: Partial<Jobs.ReqSubmitJob>;
};

const FormikJobStepWrapper: React.FC<
  React.PropsWithChildren<FormikJobStepWrapperProps>
> = ({ children, validationSchema, initialValues }) => {
  const { add, job } = useJobLauncher();
  const { nextStep } = useWizard();

  const formSubmit = useCallback(
    (value: Partial<Jobs.ReqSubmitJob>) => {
      if (value.parameterSet) {
        add({
          parameterSet: {
            ...job.parameterSet,
            ...value.parameterSet,
          },
        });
      } else {
        add(value);
      }
      nextStep && nextStep();
    },
    [nextStep, add, job]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={formSubmit}
      enableReinitialize={true}
      validateOnChange={false}
    >
      <Form>
        {children}
        <WizardNavigation />
      </Form>
    </Formik>
  );
};

export default FormikJobStepWrapper;
