import { authenticatorStore as authenticator } from './authenticator.fixtures';
import { systemsStore as systems } from './systems.fixtures';
import { filesStore as files } from './files.fixtures';
import { appsStore as apps } from './apps.fixtures';
<<<<<<< HEAD:fixtures/tapis-redux.fixture.ts
=======
import { jobsStore as jobs } from './jobs.fixtures';
>>>>>>> task/TUI-51--redux-applications-api:fixtures/tapis-redux.fixture.js

const tapisReduxStore = {
  authenticator,
  systems,
  files,
  apps,
<<<<<<< HEAD:fixtures/tapis-redux.fixture.ts
=======
  jobs
>>>>>>> task/TUI-51--redux-applications-api:fixtures/tapis-redux.fixture.js
};

export default tapisReduxStore;
