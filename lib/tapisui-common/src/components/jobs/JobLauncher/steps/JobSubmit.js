var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useJobLauncher } from '../components';
import { JSONDisplay } from 'ui';
import { fileInputsComplete } from 'utils/jobFileInputs';
import { fileInputArraysComplete } from 'utils/jobFileInputArrays';
import { jobRequiredFieldsComplete } from 'utils/jobRequiredFields';
import { validateExecSystem, ValidateExecSystemResult, } from 'utils/jobExecSystem';
import { StepSummaryField } from '../components';
import { SubmitWrapper } from 'wrappers';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Button } from 'reactstrap';
import arrayStyles from '../FieldArray.module.scss';
export var JobSubmit = function () {
    var _a, _b, _c, _d;
    var _e = useJobLauncher(), job = _e.job, app = _e.app, systems = _e.systems;
    var isComplete = validateExecSystem(job, app, systems) ===
        ValidateExecSystemResult.Complete &&
        jobRequiredFieldsComplete(job) &&
        fileInputsComplete(app, (_a = job.fileInputs) !== null && _a !== void 0 ? _a : []) &&
        fileInputArraysComplete(app, (_b = job.fileInputArrays) !== null && _b !== void 0 ? _b : []);
    var _f = Hooks.useSubmit(app.id, app.version), isLoading = _f.isLoading, error = _f.error, isSuccess = _f.isSuccess, submit = _f.submit, data = _f.data;
    var onSubmit = useCallback(function () {
        submit(job);
    }, [submit, job]);
    var summary = isComplete
        ? isSuccess
            ? "Successfully submitted job ".concat((_d = (_c = data === null || data === void 0 ? void 0 : data.result) === null || _c === void 0 ? void 0 : _c.uuid) !== null && _d !== void 0 ? _d : '')
            : "The job is ready for submission"
        : undefined;
    return (_jsxs("div", { children: [_jsx("h2", { children: "Job Submission" }), _jsxs("div", __assign({ className: arrayStyles.array }, { children: [_jsx(StepSummaryField, { field: summary, error: "All required fields must be completed before the job can be submitted" }), _jsx(SubmitWrapper, __assign({ isLoading: isLoading, error: error, success: isSuccess ? " " : '', reverse: true }, { children: _jsx(Button, __assign({ color: "primary", disabled: isLoading || !isComplete || isSuccess, onClick: onSubmit }, { children: "Submit Job" })) }))] })), _jsx("div", { children: "This is a preview of the json job submission data. You may copy it for future reference." }), _jsx(JSONDisplay, { json: job })] }));
};
export var JobSubmitSummary = function () {
    var _a, _b;
    var _c = useJobLauncher(), app = _c.app, job = _c.job, systems = _c.systems;
    var isComplete = validateExecSystem(job, app, systems) &&
        jobRequiredFieldsComplete(job) &&
        fileInputsComplete(app, (_a = job.fileInputs) !== null && _a !== void 0 ? _a : []) &&
        fileInputArraysComplete(app, (_b = job.fileInputArrays) !== null && _b !== void 0 ? _b : []);
    return (_jsx("div", { children: _jsx(StepSummaryField, { field: isComplete ? 'The job is ready for submission' : undefined, error: "All required fields must be completed before the job can be submitted" }, "job-submit-summary") }));
};
var step = {
    id: 'jobSubmit',
    name: 'Job Submission',
    render: _jsx(JobSubmit, {}),
    summary: _jsx(JobSubmitSummary, {}),
    validationSchema: {},
    generateInitialValues: function () { return ({}); },
};
export default step;
