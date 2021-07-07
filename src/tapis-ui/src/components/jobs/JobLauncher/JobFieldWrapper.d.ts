import React from 'react';
import { FieldHookConfig } from 'formik';
import './JobFieldWrapper.scss';
declare type JobFieldWrapperCustomProps = {
    label: string;
    required?: boolean;
    description: string;
    children?: React.ReactChild | React.ReactChild[];
};
export declare type JobFieldWrapperProps = {
    props: FieldHookConfig<string>;
} & JobFieldWrapperCustomProps;
declare const JobFieldWrapper: React.FC<JobFieldWrapperProps>;
export default JobFieldWrapper;
