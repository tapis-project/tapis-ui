import { useSelector } from 'react-redux';
import { list } from './systems.actions';
import { TapisState } from '../store/rootReducer';

const useSystems = (config, onApi) => {
  const { definitions, loading, error } = useSelector((state: TapisState) => state.systems);
  return {
    definitions,
    loading,
    error,
    list: () => list(config, onApi),
  };
};

export default useSystems;
