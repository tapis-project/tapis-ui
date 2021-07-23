import { TapisState } from '../../store/rootReducer';
import { InstrumentList } from "./types";

type getListingSelectorType = (state: TapisState) => InstrumentList;

const getInstruments = (projectId: string, siteId: string): getListingSelectorType => {
    return (state: TapisState): InstrumentList => {
        if(state.instruments[projectId] && state.instruments[projectId][siteId]) {
            return state.instruments[projectId][siteId];
        }
        return undefined;
    }
};

export default getInstruments;
