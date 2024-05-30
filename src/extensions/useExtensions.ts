import { useContext } from 'react';
import { default as ExtensionsContext } from './ExtensionsContext';

const useExtensions = () => {
  const { extensions } = useContext(ExtensionsContext);
  return {
    extensions
  };
};

export default useExtensions;
