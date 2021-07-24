import { TapisState } from '../../store/rootReducer';
import { InstrumentList } from "./types";

type getListingSelectorType = (state: TapisState) => InstrumentList;

export const getInstruments = (projectId: string, siteId: string): getListingSelectorType => {
    return (state: TapisState): InstrumentList => {
        if(state.instruments.instrumentMap[projectId] && state.instruments.instrumentMap[projectId][siteId]) {
            return state.instruments.instrumentMap[projectId][siteId];
        }
        return undefined;
    }
};
