import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { SystemsResponse } from './types';

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
