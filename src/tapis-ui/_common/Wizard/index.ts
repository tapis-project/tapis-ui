import React from 'react';
import Wizard from './Wizard';

export type WizardStep = {
  id: string;
  name: string;
  render: React.ReactNode
}

export default Wizard;