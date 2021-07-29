import { useSelector } from 'react-redux';
import { list, select } from './actions';
import { TapisState } from '../../store/rootReducer';
import { VariablesListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface VariablesListParams {
  onList?: VariablesListCallback,
  request: Streams.ListVariablesRequest
}

const useVariables = (config?: Config) => {
  const state = useSelector((state: TapisState) => state.variables);
  return {
    state,
    list: (params: VariablesListParams) => {
      return list(config, params.request, params.onList)
    },
    select: (variable: Streams.Site) => {
      return select(variable);
    }
  };
};

export default useVariables;
