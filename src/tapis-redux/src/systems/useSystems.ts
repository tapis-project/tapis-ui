import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../store/rootReducer';
import { SystemsListCallback } from './types';

const useSystems = (config) => {
  const { definitions, loading, error } = useSelector((state: TapisState) => state.systems);
  return {
    definitions,
    loading,
    error,
    list: (onList: SystemsListCallback) => list(config, onList),
  };
};

export default useSystems;
