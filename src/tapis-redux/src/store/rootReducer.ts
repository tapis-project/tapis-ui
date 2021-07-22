import { combineReducers } from 'redux';
import { authenticator } from '../authenticator/reducer';
import { systems } from '../systems/reducer';
import { files } from '../files/reducer';
import { apps } from '../apps/reducer';
import { jobs } from '../jobs/reducer';
import { projects } from "../streams/projects/reducer";
import { sites } from "../streams/sites/reducer";
import { instruments } from "../streams/instruments/reducer";
import { variables } from "../streams/variables/reducer";
import { measurements } from "../streams/measurements/reducer";

const rootReducer = combineReducers({
  authenticator,
  systems,
  files,
  apps,
  projects,
  jobs,
  sites,
  instruments,
  variables,
  measurements
});

export type TapisState = ReturnType<typeof rootReducer>;

export default rootReducer;