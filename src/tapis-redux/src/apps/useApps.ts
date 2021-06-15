import { useSelector } from 'react-redux';
import { list } from './list/actions';
import { TapisState } from '../store/rootReducer';
import { AppsListCallback } from './list/types';

const useSystems = (config) => {
  const { systems } = useSelector((state: TapisState) => state.systems);
  return {
    systems,
    list: (onList: AppsListCallback) => list(config, onList),
  };
};

export default useSystems;
