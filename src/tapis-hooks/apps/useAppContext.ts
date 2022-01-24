import { Apps } from '@tapis/tapis-typescript';
import withFragment from 'tapis-hooks/utils/withFragment';

const { useFragmentContext, Provider } = withFragment<Apps.TapisApp>();

export const useAppContext = () => {
  const { data, add, set, clear } = useFragmentContext();
  return {
    app: data,
    add,
    set,
    clear,
  };
};

export const AppProvider = Provider;

export default useAppContext;
