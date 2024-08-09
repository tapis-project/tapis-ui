import { type API } from 'app/apis';
import { decoder, request } from '../utils';

type ListBranchesResponse = Array<{ [key: string | number]: any }>;
type ListBranchesRequest = { username: string; repo: string };

const listBranches: API<ListBranchesRequest, ListBranchesResponse> = (
  { username, repo },
  callbacks
) => {
  decoder<ListBranchesResponse>(
    () => request(`https://api.github.com/repos/${username}/${repo}/branches`),
    callbacks
  );
};

export default listBranches;
