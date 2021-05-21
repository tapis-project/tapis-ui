import { TapisState } from '../store/rootReducer';

// TODO: Replace with Token type
const getToken: any = (state: TapisState) => state.authenticator.token;

export default getToken;
