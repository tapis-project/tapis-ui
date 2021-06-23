import { useSelector } from 'react-redux';
import { list } from './list/actions';
import { TapisState } from '../store/rootReducer';
import { JobsListCallback } from './list/types';
import { Jobs } from '@tapis/tapis-typescript';

export interface ListAppsParams {
  onList?: JobsListCallback
}

const useSystems = (config) => {
  const { jobs } = useSelector((state: TapisState) => state.jobs);
  return {
    jobs,
    list: (params: ListAppsParams & Jobs.GetJobListRequest) => list(config, params.onList),
  };
};

export default useSystems;
