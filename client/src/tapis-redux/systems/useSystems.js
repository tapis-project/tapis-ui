import { useSelector } from 'react-redux';
import { list } from './systems.actions';

const useSystems = (config, onApi) => {
  const { definitions, loading, error } = useSelector((state) => state.systems);
  return {
    definitions,
    loading,
    error,
    list: () => list(config),
  };
};

export default useSystems;
