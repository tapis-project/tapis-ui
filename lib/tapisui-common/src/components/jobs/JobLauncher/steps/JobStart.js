import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { StepSummaryField, useJobLauncher } from '../components';
import { FormikInput } from 'ui-formik/FieldWrapperFormik';
import * as Yup from 'yup';
export var JobStart = function () {
    var app = useJobLauncher().app;
    return (_jsxs("div", { children: [_jsxs("h2", { children: ["Launching ", app.id, " v", app.version] }), _jsx(FormikInput, { name: "name", required: true, label: "Name", description: "A name for this job" }), _jsx(FormikInput, { name: "description", required: false, label: "Description", description: "A description of this job" })] }));
};
export var JobStartSummary = function () {
    var job = useJobLauncher().job;
    var name = job.name, description = job.description, appId = job.appId, appVersion = job.appVersion;
    return (_jsxs("div", { children: [_jsx(StepSummaryField, { field: name, error: "A job name is required" }, "job-start-name-summary"), _jsx(StepSummaryField, { field: description }, "job-start-description-summary"), _jsx("div", { children: _jsxs("i", { children: ["Application: ", appId, " v", appVersion] }) })] }));
};
var generateInitialValues = function (_a) {
    var job = _a.job;
    return ({
        name: job.name,
        description: job.description,
    });
};
var validationSchema = Yup.object({
    name: Yup.string().required().min(1).max(64),
    description: Yup.string(),
});
var step = {
    id: 'start',
    name: 'Job Name',
    render: _jsx(JobStart, {}),
    summary: _jsx(JobStartSummary, {}),
    generateInitialValues: generateInitialValues,
    validationSchema: validationSchema,
};
export default step;
