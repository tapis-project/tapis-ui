import { TapisState } from '../store/rootReducer';
import { Jobs } from '@tapis/tapis-typescript';


export const getJobs = (state: TapisState) => state.jobs.jobs.results;

type getJobSelectorType = (state: TapisState) => Jobs.JobListDTO;

export const getJob = (uuid: string): getJobSelectorType => {
  return (state: TapisState): Jobs.JobListDTO => {
    return state.jobs.jobs.results.find(
      (job) => job.uuid === uuid
    )
  }
}