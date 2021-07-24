import { TapisState } from '../../store/rootReducer';
import { VariableList } from "./types";

type getListingSelectorType = (state: TapisState) => VariableList;

const getVariables = (projectId: string, siteId: string, instrumentId: string): getListingSelectorType => {
    return (state: TapisState): VariableList => {
        if(state.variables[projectId] && state.variables[projectId][siteId] && state.variables[projectId][siteId][instrumentId]) {
            return state.variables[projectId][siteId][instrumentId];
        }
        return undefined;
    }
};

export default getVariables;
