import { useSelector } from 'react-redux';
import { list } from './systems.actions';

const useSystems = () => {
  const { definitions, loading, error } = useSelector((state) => state.systems);
  return {
    definitions,
    loading,
    error,
    list,
  };
};

export default useSystems;
