import { combineReducers } from 'redux';
import { authenticator } from '../authenticator/reducer';
//import { systems } from '../systems/systems.reducer';

export default combineReducers({
  authenticator,
//  systems,
});
