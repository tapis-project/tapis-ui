import { TapisState } from '../store/rootReducer';
import { Token } from './types';

const getToken = (state: TapisState): Token => state.authenticator.token;

export default getToken;
