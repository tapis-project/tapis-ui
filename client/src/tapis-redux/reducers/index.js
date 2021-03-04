import { combineReducers } from 'redux';
import auth from '../auth/auth.reducer';
import systems from '../systems/systems.reducer';

export default combineReducers({
  auth,
  systems,
});
