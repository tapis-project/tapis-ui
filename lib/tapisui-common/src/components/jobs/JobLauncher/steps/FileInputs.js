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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import FieldWrapper from 'ui/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import { generateFileInputFromAppInput, getIncompleteJobInputs, getAppInputsIncludedByDefault, } from 'utils/jobFileInputs';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext } from 'formik';
import { FormikInput, FormikCheck, FormikTapisFile, } from 'ui-formik/FieldWrapperFormik';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
var upperCaseFirstLetter = function (str) {
    var lower = str.toLowerCase();
    return "".concat(lower.slice(0, 1).toUpperCase()).concat(lower.slice(1));
};
var JobInputField = function (_a) {
    var item = _a.item, index = _a.index, remove = _a.remove;
    var app = useJobLauncher().app;
    var name = item.name, sourceUrl = item.sourceUrl;
    var inputMode = useMemo(function () {
        var _a, _b, _c, _d;
        return (_d = (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputs) === null || _b === void 0 ? void 0 : _b.find(function (appInput) { return appInput.name === item.name; })) === null || _c === void 0 ? void 0 : _c.inputMode) !== null && _d !== void 0 ? _d : undefined;
    }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var isRequired = inputMode === Apps.FileInputModeEnum.Required;
    var note = "".concat(inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined');
    return (_jsx(_Fragment, { children: _jsxs(Collapse, __assign({ open: !sourceUrl, title: name !== null && name !== void 0 ? name : 'File Input', note: note, className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "fileInputs.".concat(index, ".name"), label: "Name", required: true, description: "".concat(isRequired
                        ? 'This input is required and cannot be renamed'
                        : 'Name of this input'), disabled: isRequired }), _jsx(FormikTapisFile, { name: "fileInputs.".concat(index, ".sourceUrl"), label: "Source URL", required: true, description: "Input TAPIS file as a pathname, TAPIS URI or web URL" }), _jsx(FormikInput, { name: "fileInputs.".concat(index, ".targetPath"), label: "Target Path", required: true, description: "File mount path inside of running container" }), _jsx(FormikInput, { name: "fileInputs.".concat(index, ".description"), label: "Description", required: false, description: "Description of this input" }), _jsx(FormikCheck, { name: "fileInputs.".concat(index, ".autoMountLocal"), label: "Auto-mount Local", required: false, description: "If this is true, the source URL will be mounted from the execution system's local file system" }), !isRequired && (_jsx(Button, __assign({ onClick: function () { return remove(index); }, size: "sm" }, { children: "Remove" })))] })) }));
};
var getFileInputsOfMode = function (app, inputMode) {
    var _a, _b, _c;
    return (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputs) === null || _b === void 0 ? void 0 : _b.filter(function (appInput) { return appInput.inputMode === inputMode; })) !== null && _c !== void 0 ? _c : [];
};
var inputIncluded = function (input, jobInputs) {
    return jobInputs.some(function (jobInput) { return jobInput.name === input.name; });
};
var OptionalInput = function (_a) {
    var _b;
    var input = _a.input, included = _a.included, onInclude = _a.onInclude;
    return (_jsxs(Collapse, __assign({ title: "".concat(input.name, " ").concat(included ? '(included)' : ''), className: styles['optional-input'] }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: (_b = input.description) !== null && _b !== void 0 ? _b : '' })), _jsx(FieldWrapper, __assign({ label: "Source URL", required: true, description: "Input TAPIS file as a pathname, TAPIS URI or web URL" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: input.sourceUrl, disabled: true }) })), _jsx(FieldWrapper, __assign({ label: "Target Path", required: true, description: "File mount path inside of running container" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: input.targetPath, disabled: true }) })), _jsx(Button, __assign({ onClick: function () { return onInclude(); }, disabled: included, size: "sm" }, { children: "Include" })), included && (_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "This optional input has already been included with your job file inputs." })))] })));
};
var OptionalInputs = function (_a) {
    var _b;
    var arrayHelpers = _a.arrayHelpers;
    var app = useJobLauncher().app;
    var values = useFormikContext().values;
    var optionalInputs = useMemo(function () { return getFileInputsOfMode(app, Apps.FileInputModeEnum.Optional); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var formFileInputs = (_b = values === null || values === void 0 ? void 0 : values.fileInputs) !== null && _b !== void 0 ? _b : [];
    return !!optionalInputs.length ? (_jsxs(Collapse, __assign({ title: "Optional File Inputs", open: true, note: "".concat(optionalInputs.length, " additional files"), className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs are defined in the application and can be included with your job." })), optionalInputs.map(function (optionalInput) {
                var alreadyIncluded = inputIncluded(optionalInput, formFileInputs);
                var onInclude = function () {
                    arrayHelpers.push(generateFileInputFromAppInput(optionalInput));
                };
                return (_jsx("div", __assign({ className: fieldArrayStyles.item }, { children: _jsx(OptionalInput, { input: optionalInput, onInclude: onInclude, included: alreadyIncluded }) }), "optional-input-".concat(optionalInput.name)));
            })] }))) : null;
};
var FixedInput = function (_a) {
    var _b;
    var input = _a.input;
    return (_jsxs(Collapse, __assign({ title: "".concat(input.name), className: styles['optional-input'] }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: (_b = input.description) !== null && _b !== void 0 ? _b : '' })), _jsx(FieldWrapper, __assign({ label: "Source URL", required: true, description: "Input TAPIS file as a pathname, TAPIS URI or web URL" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: input.sourceUrl, disabled: true }) })), _jsx(FieldWrapper, __assign({ label: "Target Path", required: true, description: "File mount path inside of running container" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: input.targetPath, disabled: true }) }))] })));
};
var FixedInputs = function () {
    var app = useJobLauncher().app;
    var fixedInputs = useMemo(function () { return getFileInputsOfMode(app, Apps.FileInputModeEnum.Fixed); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    return (_jsxs(Collapse, __assign({ title: "Fixed File Inputs", open: true, note: "".concat(fixedInputs.length, " additional files"), className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs are defined in the application and will automatically be included with your job. They cannot be removed or altered." })), fixedInputs.map(function (fixedInput) { return (_jsx("div", __assign({ className: fieldArrayStyles.item }, { children: _jsx(FixedInput, { input: fixedInput }) }), "fixed-input-".concat(fixedInput.name))); })] })));
};
var JobInputs = function (_a) {
    var _b;
    var arrayHelpers = _a.arrayHelpers;
    var values = useFormikContext().values;
    var app = useJobLauncher().app;
    var requiredInputs = useMemo(function () { return getFileInputsOfMode(app, Apps.FileInputModeEnum.Required); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var requiredText = requiredInputs.length > 0 ? "Required (".concat(requiredInputs.length, ")") : '';
    var jobInputs = (_b = values === null || values === void 0 ? void 0 : values.fileInputs) !== null && _b !== void 0 ? _b : [];
    return (_jsxs(Collapse, __assign({ open: requiredInputs.length > 0, title: "File Inputs", note: "".concat(jobInputs.length, " items"), requiredText: requiredText, isCollapsable: requiredInputs.length === 0, className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs will be submitted with your job." })), jobInputs.map(function (jobInput, index) { return (_jsx(JobInputField, { item: jobInput, index: index, remove: arrayHelpers.remove }, "fileInputs.".concat(index))); }), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push({}); }, size: "sm" }, { children: "+ Add File Input" }))] })));
};
export var FileInputs = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "File Inputs" }), _jsx(FieldArray, { name: "fileInputs", render: function (arrayHelpers) {
                    return (_jsxs(_Fragment, { children: [_jsx(JobInputs, { arrayHelpers: arrayHelpers }), _jsx(OptionalInputs, { arrayHelpers: arrayHelpers }), _jsx(FixedInputs, {})] }));
                } })] }));
};
export var FileInputsSummary = function () {
    var _a, _b, _c;
    var _d = useJobLauncher(), job = _d.job, app = _d.app;
    var jobFileInputs = (_a = job.fileInputs) !== null && _a !== void 0 ? _a : [];
    var appFileInputs = (_c = (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputs) !== null && _c !== void 0 ? _c : [];
    var missingRequiredInputs = appFileInputs.filter(function (appFileInput) {
        return appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
            !jobFileInputs.some(function (jobFileInput) { return jobFileInput.name === appFileInput.name; });
    });
    var incompleteJobInputs = getIncompleteJobInputs(appFileInputs, jobFileInputs);
    var includedByDefault = getAppInputsIncludedByDefault(appFileInputs, jobFileInputs);
    return (_jsxs("div", { children: [jobFileInputs.map(function (jobFileInput) {
                var _a, _b, _c;
                var complete = !incompleteJobInputs.some(function (incompleteInput) { return incompleteInput.name === jobFileInput.name; });
                // If this job file input is complete, display its name or sourceUrl
                var field = complete
                    ? (_a = "".concat(jobFileInput.name, ": ").concat(jobFileInput.sourceUrl)) !== null && _a !== void 0 ? _a : jobFileInput.sourceUrl
                    : undefined;
                var key = (_c = (_b = jobFileInput.name) !== null && _b !== void 0 ? _b : jobFileInput.sourceUrl) !== null && _c !== void 0 ? _c : jobFileInput.targetPath;
                // If this job file input is incomplete, display its name or sourceUrl
                var error = !complete
                    ? "".concat(key !== null && key !== void 0 ? key : 'A file input', " is missing required information")
                    : undefined;
                return (_jsx(StepSummaryField, { field: field, error: error }, "file-inputs-summary-".concat(key !== null && key !== void 0 ? key : uuidv4())));
            }), missingRequiredInputs.map(function (requiredFileInput) { return (_jsx(StepSummaryField, { error: "".concat(requiredFileInput.name, " is required") }, "file-inputs-required-error-".concat(requiredFileInput.name))); }), includedByDefault.map(function (defaultInput) { return (_jsx(StepSummaryField, { field: "".concat(defaultInput.name, " included by default") }, "file-inputs-default-".concat(defaultInput.name))); })] }, "file-inputs-summary"));
};
var validationSchema = Yup.object().shape({
    fileInputs: Yup.array().of(Yup.object().shape({
        name: Yup.string().min(1).required('A fileInput name is required'),
        sourceUrl: Yup.string().min(1).required('A sourceUrl is required'),
        targetPath: Yup.string().min(1).required('A targetPath is required'),
        autoMountLocal: Yup.boolean(),
    })),
});
var step = {
    id: 'fileInputs',
    name: 'File Inputs',
    render: _jsx(FileInputs, {}),
    summary: _jsx(FileInputsSummary, {}),
    validationSchema: validationSchema,
    generateInitialValues: function (_a) {
        var job = _a.job;
        return ({
            fileInputs: job.fileInputs,
        });
    },
};
export default step;
