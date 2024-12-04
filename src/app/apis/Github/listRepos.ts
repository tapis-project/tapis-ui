import { type API } from 'app/apis';
import { decoder, request } from '../utils';

type ListReposResponse = Array<{ [key: string | number]: any }>;
type ListReposRequest = { username: string };

const listRepos: API<ListReposRequest, ListReposResponse> = (
  { username },
  callbacks
) => {
  decoder<ListReposResponse>(
    () => request(`https://api.github.com/users/${username}/repos`),
    callbacks
  );
};

export default listRepos;
