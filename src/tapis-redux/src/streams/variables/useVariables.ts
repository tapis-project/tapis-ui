import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { VariablesListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface VariablesListParams {
  onList?: VariablesListCallback,
  request: Streams.ListVariablesRequest
}

const useVariables = (config?: Config) => {
  const { variables } = useSelector((state: TapisState) => state.variables);
  return {
    variables,
    list: (params: VariablesListParams) => list(config, params.request, params.onList),
  };
};

export default useVariables;
