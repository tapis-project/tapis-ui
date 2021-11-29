import Wizard from './Wizard';

export type Step = {
  name: string;
  component: React.ReactNode;
  complete: boolean;
};

export default Wizard;
