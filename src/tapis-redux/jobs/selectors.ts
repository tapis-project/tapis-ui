import { TapisState } from '../store/rootReducer';
import { Jobs } from '@tapis/tapis-typescript';


export const getJobs = (state: TapisState) => state.jobs.jobs.results;

type getJobSelectorType = (state: TapisState) => Jobs.JobListDTO;

export const getJob = (uuid: string) => {
  return (state: TapisState): Jobs.JobListDTO | null | undefined => {
    return state.jobs.jobs.results.find(
      (job) => job?.uuid === uuid
    )
  }
}