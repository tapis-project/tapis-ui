import { combineReducers } from 'redux';
import { authenticator } from '../authenticator/reducer';
import { systems } from '../systems/reducer';
import { files } from '../files/reducer';
import { apps } from '../apps/reducer';
import { jobs } from '../jobs/reducer';

const rootReducer = combineReducers({
  authenticator,
  systems,
  files,
  apps,
  jobs
});

export type TapisState = ReturnType<typeof rootReducer>;

export default rootReducer;