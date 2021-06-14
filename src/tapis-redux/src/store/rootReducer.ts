import { combineReducers } from 'redux';
import { authenticator } from '../authenticator/reducer';
import { systems } from '../systems/reducer';
import { files } from '../files/reducer';

const rootReducer = combineReducers({
  authenticator,
  systems,
  files
});

export type TapisState = ReturnType<typeof rootReducer>;

export default rootReducer;