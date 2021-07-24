import { TapisState } from '../../store/rootReducer';
import { SiteList } from "./types";

type getListingSelectorType = (state: TapisState) => SiteList;

export const getSites = (projectId: string): getListingSelectorType => {
    return (state: TapisState): SiteList => {
        return state.sites.siteMap[projectId];
    };
};

