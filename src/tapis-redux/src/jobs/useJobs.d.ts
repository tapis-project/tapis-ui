import { JobsListCallback } from './list/types';
import { JobsSubmitCallback } from './submit/types';
import { Jobs } from '@tapis/tapis-typescript';
import { Config } from 'tapis-redux/types';
export interface ListJobsParams {
    onList?: JobsListCallback;
    request?: Jobs.GetJobListRequest;
}
export interface SubmitJobsParams {
    onSubmit?: JobsSubmitCallback;
    request: Jobs.ReqSubmitJob;
}
declare const useSystems: (config?: Config) => {
    jobs: import("tapis-redux/types").TapisListResults<Jobs.JobListDTO>;
    submission: import("./submit/types").JobsSubmitState;
    list: (params: ListJobsParams) => import("../sagas/types").ApiSagaRequest<Jobs.RespGetJobList>;
    submit: (params: SubmitJobsParams) => import("../sagas/types").ApiSagaRequest<Jobs.RespSubmitJob>;
    resetSubmit: () => import("./submit/types").JobsSubmitReset;
};
export default useSystems;
