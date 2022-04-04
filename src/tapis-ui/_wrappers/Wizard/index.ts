import React from 'react';
import Wizard from './Wizard';

export type WizardStep = {
  id: string;
  name: string;
  render: React.ReactNode;
  summary: React.ReactNode;
};

export { useWizard, WizardNavigation } from './Wizard';
export { default as WizardSubmitWrapper } from './WizardSubmitWrapper';
export default Wizard;
