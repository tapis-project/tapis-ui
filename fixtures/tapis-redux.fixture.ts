import { authenticatorStore as authenticator } from './authenticator.fixtures';
import { systemsStore as systems } from './systems.fixtures';
import { filesStore as files } from './files.fixtures';
import { appsStore as apps } from './apps.fixtures';

const tapisReduxStore = {
  authenticator,
  systems,
  files,
  apps,
};

export default tapisReduxStore;
