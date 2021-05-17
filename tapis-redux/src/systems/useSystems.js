import { useSelector } from '../../../tapis-ui/node_modules/react-redux';
// import { useSelector } from 'react-redux';
import { list } from './systems.actions';

const useSystems = (config, onApi) => {
  const { definitions, loading, error } = useSelector((state) => state.systems);
  return {
    definitions,
    loading,
    error,
    list: () => list(config, onApi),
  };
};

export default useSystems;
