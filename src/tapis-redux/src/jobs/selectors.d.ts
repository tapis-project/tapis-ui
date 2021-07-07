import { TapisState } from '../store/rootReducer';
import { Jobs } from '@tapis/tapis-typescript';
export declare const getJobs: (state: TapisState) => Jobs.JobListDTO[];
declare type getJobSelectorType = (state: TapisState) => Jobs.JobListDTO;
export declare const getJob: (uuid: string) => getJobSelectorType;
export {};
