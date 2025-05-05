import { deleteClients } from '@tapis/tapisui-api/dist/authenticator';

const QueryKeys = {
  login: 'authenticator/login',
  listProfiles: 'authenticator/listprofiles',
  listClients: 'authenticator/listclients',
  deleteClients: 'authenticator/deleteclients',
  createClient: 'authenticator/createclient',
};

export default QueryKeys;
