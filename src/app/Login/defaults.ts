// Generic Tapis copy for deployments whose extension doesn't provide any —
// shared by the /login landing page and the LoginDialog modal (kept out of
// either component so neither has to import the other).
export const DEFAULT_DESCRIPTION =
  'TapisUI is the web interface to the Tapis platform — NSF-funded APIs ' +
  'for running code, managing data, and hosting services on HPC and cloud ' +
  'systems.';

export const DEFAULT_LINKS = [
  { label: 'Tapis Project', url: 'https://tapis-project.org' },
  { label: 'Documentation', url: 'https://tapis.readthedocs.io' },
];
