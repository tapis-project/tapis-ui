import React from 'react';
import { JobsListCallback } from 'tapis-redux/jobs/list/types';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
export declare type OnSelectCallback = (app: Jobs.JobListDTO) => any;
interface JobsListingProps {
    config?: Config;
    onList?: JobsListCallback;
    onSelect?: OnSelectCallback;
}
declare const JobsListing: React.FC<JobsListingProps>;
export default JobsListing;
