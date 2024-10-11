import { useContext } from 'react';
import { default as SystemContext } from './SystemContext';

const useSystem = () => {
  const { system } = useContext(SystemContext);
  return system;
};

export default useSystem;
