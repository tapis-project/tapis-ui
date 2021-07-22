import { Streams } from "@tapis/tapis-typescript";
import { ApiCallback, TapisListResults } from 'tapis-redux/types';
import * as ACTIONS from './actionTypes';



// export type SiteListingProjectMap = {
//   [ projectId: string ]: TapisListResults<Streams.Site>
// }

export type SiteList = TapisListResults<Streams.Site>;

export type SitesReducerState = {
  [ projectId: string ]: TapisListResults<Streams.Site>
}



export interface SitesListingRequestPayload {
  // Original request parameters
  params: Streams.ListSitesRequest
}

export type SitesListingSuccessPayload = {
  incoming: Array<Streams.Site>
} & SitesListingRequestPayload;

export type SitesListingFailurePayload = {
  error: Error
} & SitesListingRequestPayload;

export type SitesListingRequest = {
  type: typeof ACTIONS.TAPIS_SITES_LIST_REQUEST;
  payload: SitesListingRequestPayload;
}

export type SitesListingSuccess = {
  type: typeof ACTIONS.TAPIS_SITES_LIST_SUCCESS;
  payload: SitesListingSuccessPayload;
}

export type SitesListingFailure = {
  type: typeof ACTIONS.TAPIS_SITES_LIST_FAILURE;
  payload: SitesListingFailurePayload
}

export type SitesListingAction = 
  | SitesListingRequest
  | SitesListingSuccess
  | SitesListingFailure;


export type SitesListCallback = ApiCallback<Streams.RespListSites>;
