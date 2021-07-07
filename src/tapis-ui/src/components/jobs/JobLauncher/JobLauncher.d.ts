import React from 'react';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
export declare type OnSubmitCallback = (job: Jobs.Job) => any;
interface JobLauncherProps {
    config?: Config;
    initialValues?: Jobs.ReqSubmitJob;
    onSubmit?: OnSubmitCallback;
}
declare const JobLauncherProps: React.FC<JobLauncherProps>;
export default JobLauncherProps;
