import { useSelector } from 'react-redux';
import { list } from './streams.actions';

const useStreams = (config, onApi) => {
  const { definitions, loading, error } = useSelector((state) => state.streams);
  return {
    definitions,
    loading,
    error,
    list: () => list(config, onApi),
  };
};

export default useStreams;
