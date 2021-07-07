import { Jobs } from '@tapis/tapis-typescript';
import { JobsSubmitCallback, JobsSubmitReset } from './types';
import { Config } from 'tapis-redux/types';
export declare const resetSubmit: () => JobsSubmitReset;
export declare const submit: (config: Config, onSubmit: JobsSubmitCallback, params: Jobs.ReqSubmitJob) => import("tapis-redux/sagas/types").ApiSagaRequest<Jobs.RespSubmitJob>;
