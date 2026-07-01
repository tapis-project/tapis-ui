import { modelCardDetails } from '@tapis/tapisui-api/dist/ml-hub/models';

const QueryKeys = {
  list: 'mlhub/models/list',
  discover: 'mlhub/models/discover',
  details: 'mlhub/models/details',
  listDownloadLinks: 'mlhub/models/listDownloadLinks',
  listByAuthor: 'mlhub/models/listByAuthor',
  listByDataset: 'mlhub/models/listByDataset',
  listByLanguage: 'mlhub/models/listByLanguage',
  listByLibrary: 'mlhub/models/listByLibrary',
  listByPlatform: 'mlhub/models/listByPlatform',
  listByQuery: 'mlhub/models/listByQuery',
  listByTask: 'mlhub/models/listByTask',
  getByAuthorAndName: 'mlhub/models/getByAuthorAndName',
  create: 'mlhub/models/create',
  inferenceServerDetails: 'mlhub/models/inference/inferenceServerDetails',
  modelCardDetails: 'mlhub/models/modelCardDetails',
};

export default QueryKeys;
