import { combineReducers } from 'redux';
import { authenticator } from '../authenticator/reducer';
import { systems } from '../systems/reducer';

const rootReducer = combineReducers({
  authenticator,
  systems,
});

export type TapisState = ReturnType<typeof rootReducer>;

export default rootReducer;