import React from 'react';
import Wizard from './Wizard';

export type WizardStep<T> = {
  id: string;
  name: string;
  render: React.ReactNode;
  summary: React.ReactNode;
  validationSchema: any;
  initialValues: Partial<T>;
  validate?: (values: Partial<T>) => void;
};

export { useWizard, WizardNavigation } from './Wizard';
export default Wizard;
