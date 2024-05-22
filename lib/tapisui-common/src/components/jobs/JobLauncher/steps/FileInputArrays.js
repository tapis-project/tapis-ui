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
import { useMemo, useCallback } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { Input, Button, FormGroup } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import { generateFileInputArrayFromAppInput, getIncompleteJobInputArrays, getAppInputArraysIncludedByDefault, } from 'utils/jobFileInputArrays';
import { Collapse, Icon, FieldWrapper } from 'ui';
import { useModal } from 'ui';
import { FileSelectModal } from 'components/files';
import { FieldArray, useFormikContext, Field, ErrorMessage, } from 'formik';
import { FormikInput, FormikTapisFileInput, } from 'ui-formik/FieldWrapperFormik';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import arrayStyles from './FileInputArrays.module.scss';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from '../FieldArray.module.scss';
import formStyles from 'ui-formik/FieldWrapperFormik/FieldWrapperFormik.module.css';
var SourceUrlsField = function (_a) {
    var fileInputArrayIndex = _a.fileInputArrayIndex, arrayHelpers = _a.arrayHelpers;
    var values = useFormikContext().values;
    var sourceUrls = useMemo(function () {
        var _a;
        return !!values.fileInputArrays
            ? (_a = values.fileInputArrays[fileInputArrayIndex].sourceUrls) !== null && _a !== void 0 ? _a : []
            : [];
    }, [values, fileInputArrayIndex]);
    var push = arrayHelpers.push;
    var _b = useModal(), modal = _b.modal, open = _b.open, close = _b.close;
    var onSelect = useCallback(function (systemId, files) {
        files.forEach(function (file) {
            var newSourceUrl = "tapis://".concat(systemId !== null && systemId !== void 0 ? systemId : '').concat(file.path);
            if (!sourceUrls.some(function (sourceUrl) { return sourceUrl === newSourceUrl; })) {
                push(newSourceUrl);
            }
        });
    }, [push, sourceUrls]);
    return (_jsxs(FormGroup, { children: [_jsx("div", __assign({ className: arrayStyles.sourceUrls }, { children: sourceUrls.map(function (_, sourceUrlIndex) {
                    var sourceUrlName = "fileInputArrays.".concat(fileInputArrayIndex, ".sourceUrls.").concat(sourceUrlIndex);
                    return (_jsxs("div", { children: [_jsx(Field, __assign({ name: sourceUrlName }, { children: function (_a) {
                                    var field = _a.field;
                                    return (_jsx(FormikTapisFileInput, __assign({}, field, { append: _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(sourceUrlIndex); }, disabled: sourceUrls.length === 1 && sourceUrlIndex === 0 }, { children: _jsx(Icon, { name: "close" }) })) })));
                                } })), _jsx(ErrorMessage, __assign({ name: sourceUrlName, className: "form-field__help" }, { children: function (message) { return (_jsx("div", __assign({ className: "".concat(formStyles['form-field__help'], " ").concat(styles.description) }, { children: message }))); } }))] }, sourceUrlName));
                }) })), _jsxs("div", { children: [_jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.push(''); } }, { children: "+ Add Source URL" })), _jsx(Button, __assign({ size: "sm", onClick: function () { return open(); } }, { children: "+ Browse for Files" }))] }), modal && _jsx(FileSelectModal, { toggle: close, onSelect: onSelect })] }));
};
var upperCaseFirstLetter = function (str) {
    var lower = str.toLowerCase();
    return "".concat(lower.slice(0, 1).toUpperCase()).concat(lower.slice(1));
};
var JobInputArrayField = function (_a) {
    var item = _a.item, index = _a.index, remove = _a.remove;
    var app = useJobLauncher().app;
    var name = item.name, sourceUrls = item.sourceUrls;
    var inputMode = useMemo(function () {
        var _a, _b, _c, _d;
        return (_d = (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) === null || _b === void 0 ? void 0 : _b.find(function (appInput) { return appInput.name === item.name; })) === null || _c === void 0 ? void 0 : _c.inputMode) !== null && _d !== void 0 ? _d : undefined;
    }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var isRequired = inputMode === Apps.FileInputModeEnum.Required;
    var note = "".concat(inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined');
    return (_jsxs(Collapse, __assign({ open: !sourceUrls, title: name !== null && name !== void 0 ? name : 'File Input Array', note: note, className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "fileInputArrays.".concat(index, ".name"), label: "Name", required: true, description: "".concat(isRequired
                    ? 'This input is required and cannot be renamed'
                    : 'Name of this input'), disabled: isRequired }), _jsx(FieldArray, { name: "fileInputArrays.".concat(index, ".sourceUrls"), render: function (arrayHelpers) { return (_jsx(FieldWrapper, __assign({ label: "Source URLs", required: true, description: "Input TAPIS files as pathnames, TAPIS URIs or web URLs" }, { children: _jsx(SourceUrlsField, { fileInputArrayIndex: index, arrayHelpers: arrayHelpers }) }))); } }), _jsx(FormikInput, { name: "fileInputArrays.".concat(index, ".targetDir"), label: "Target Directory", required: true, description: "File mount path inside of running container" }), _jsx(FormikInput, { name: "fileInputArrays.".concat(index, ".description"), label: "Description", required: false, description: "Description of this input" }), !isRequired && (_jsx(Button, __assign({ onClick: function () { return remove(index); }, size: "sm" }, { children: "Remove" })))] })));
};
var getFileInputArraysOfMode = function (app, inputMode) {
    var _a, _b, _c;
    return (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) === null || _b === void 0 ? void 0 : _b.filter(function (appInputArray) { return appInputArray.inputMode === inputMode; })) !== null && _c !== void 0 ? _c : [];
};
var inputArrayIncluded = function (input, jobInputArrays) {
    return jobInputArrays.some(function (jobInputArray) { return jobInputArray.name === input.name; });
};
var OptionalInputArray = function (_a) {
    var _b, _c;
    var inputArray = _a.inputArray, included = _a.included, onInclude = _a.onInclude;
    return (_jsxs(Collapse, __assign({ title: "".concat(inputArray.name, " ").concat(included ? '(included)' : ''), className: styles['optional-input'] }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: (_b = inputArray.description) !== null && _b !== void 0 ? _b : '' })), _jsx(FieldWrapper, __assign({ label: "Source URLs", required: true, description: "Input TAPIS files as pathnames, TAPIS URIs or web URLs" }, { children: (_c = inputArray.sourceUrls) === null || _c === void 0 ? void 0 : _c.map(function (sourceUrl) { return (_jsx(Input, { bsSize: "sm", defaultValue: sourceUrl, disabled: true })); }) })), _jsx(FieldWrapper, __assign({ label: "Target Path", required: true, description: "File mount path inside of running container" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: inputArray.targetDir, disabled: true }) })), _jsx(Button, __assign({ onClick: function () { return onInclude(); }, disabled: included, size: "sm" }, { children: "Include" })), included && (_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "This optional input array has already been included with your job file inputs." })))] })));
};
var OptionalInputArrays = function (_a) {
    var _b;
    var arrayHelpers = _a.arrayHelpers;
    var app = useJobLauncher().app;
    var values = useFormikContext().values;
    var optionalInputArrays = useMemo(function () { return getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Optional); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var formFileInputArrays = (_b = values === null || values === void 0 ? void 0 : values.fileInputArrays) !== null && _b !== void 0 ? _b : [];
    return !!optionalInputArrays.length ? (_jsxs(Collapse, __assign({ title: "Optional File Input Arrays", open: true, note: "".concat(optionalInputArrays.length, " additional files"), className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs are defined in the application and can be included with your job." })), optionalInputArrays.map(function (optionalInputArray) {
                var alreadyIncluded = inputArrayIncluded(optionalInputArray, formFileInputArrays);
                var onInclude = function () {
                    arrayHelpers.push(generateFileInputArrayFromAppInput(optionalInputArray));
                };
                return (_jsx("div", __assign({ className: fieldArrayStyles.item }, { children: _jsx(OptionalInputArray, { inputArray: optionalInputArray, onInclude: onInclude, included: alreadyIncluded }) }), "optional-input-array-".concat(optionalInputArray.name)));
            })] }))) : null;
};
var FixedInputArray = function (_a) {
    var _b, _c;
    var inputArray = _a.inputArray;
    return (_jsxs(Collapse, __assign({ title: "".concat(inputArray.name), className: styles['optional-input'] }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: (_b = inputArray.description) !== null && _b !== void 0 ? _b : '' })), _jsx(FieldWrapper, __assign({ label: "Source URLs", required: true, description: "Input TAPIS files as pathnames, TAPIS URIs or web URLs" }, { children: (_c = inputArray.sourceUrls) === null || _c === void 0 ? void 0 : _c.map(function (sourceUrl, index) { return (_jsx(Input, { bsSize: "sm", defaultValue: sourceUrl, disabled: true }, "fixed-input-array-".concat(inputArray.name, "-").concat(index))); }) })), _jsx(FieldWrapper, __assign({ label: "Target Directory", required: true, description: "File mount path inside of running container" }, { children: _jsx(Input, { bsSize: "sm", defaultValue: inputArray.targetDir, disabled: true }) }))] })));
};
var FixedInputArrays = function () {
    var app = useJobLauncher().app;
    var fixedInputArrays = useMemo(function () { return getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Fixed); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    return (_jsxs(Collapse, __assign({ title: "Fixed File Input Arrays", open: true, note: "".concat(fixedInputArrays.length, " additional files"), className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs are defined in the application and will automatically be included with your job. They cannot be removed or altered." })), fixedInputArrays.map(function (fixedInputArray) { return (_jsx("div", __assign({ className: fieldArrayStyles.item }, { children: _jsx(FixedInputArray, { inputArray: fixedInputArray }) }), "fixed-input-".concat(fixedInputArray.name))); })] })));
};
var JobInputArrays = function (_a) {
    var _b;
    var arrayHelpers = _a.arrayHelpers;
    var values = useFormikContext().values;
    var app = useJobLauncher().app;
    var requiredInputArrays = useMemo(function () { return getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Required); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var requiredText = requiredInputArrays.length > 0
        ? "Required (".concat(requiredInputArrays.length, ")")
        : '';
    var jobInputArrays = (_b = values === null || values === void 0 ? void 0 : values.fileInputArrays) !== null && _b !== void 0 ? _b : [];
    return (_jsxs(Collapse, __assign({ open: requiredInputArrays.length > 0, title: "File Inputs Arrays", note: "".concat(jobInputArrays.length, " items"), requiredText: requiredText, isCollapsable: requiredInputArrays.length === 0, className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Input Arrays will be submitted with your job." })), jobInputArrays.map(function (jobInputArray, index) { return (_jsx(JobInputArrayField, { item: jobInputArray, index: index, remove: arrayHelpers.remove }, "render-fileInputArrays.".concat(index))); }), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push({ sourceUrls: [''] }); }, size: "sm" }, { children: "+ Add File Input Array" }))] })));
};
export var FileInputArrays = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "File Input Arrays" }), _jsx(FieldArray, { name: "fileInputArrays", render: function (arrayHelpers) {
                    return (_jsxs(_Fragment, { children: [_jsx(JobInputArrays, { arrayHelpers: arrayHelpers }), _jsx(OptionalInputArrays, { arrayHelpers: arrayHelpers }), _jsx(FixedInputArrays, {})] }));
                } })] }));
};
export var FileInputArraysSummary = function () {
    var _a, _b, _c;
    var _d = useJobLauncher(), job = _d.job, app = _d.app;
    var jobFileInputArrays = (_a = job.fileInputArrays) !== null && _a !== void 0 ? _a : [];
    var appFileInputArrays = (_c = (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputArrays) !== null && _c !== void 0 ? _c : [];
    var missingRequiredInputArrays = appFileInputArrays.filter(function (appFileInputArray) {
        return appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
            !jobFileInputArrays.some(function (jobFileInputArray) { return jobFileInputArray.name === appFileInputArray.name; });
    });
    var incompleteJobInputArrays = getIncompleteJobInputArrays(appFileInputArrays, jobFileInputArrays);
    var includedByDefault = getAppInputArraysIncludedByDefault(appFileInputArrays, jobFileInputArrays);
    return (_jsxs("div", { children: [jobFileInputArrays.map(function (jobFileInputArray) {
                var _a, _b, _c, _d;
                var complete = !incompleteJobInputArrays.some(function (incompleteInput) { return incompleteInput.name === jobFileInputArray.name; });
                // If this job file input is complete, display its name or sourceUrl
                var key = (_b = (_a = jobFileInputArray.name) !== null && _a !== void 0 ? _a : (jobFileInputArray.sourceUrls
                    ? "".concat(jobFileInputArray.sourceUrls[0], "...")
                    : undefined)) !== null && _b !== void 0 ? _b : jobFileInputArray.targetDir;
                // If this job file input is incomplete, display its name or sourceUrl
                var error = !complete
                    ? "".concat(key !== null && key !== void 0 ? key : 'A file input array', " is missing required information")
                    : undefined;
                return (_jsx(StepSummaryField, { field: "".concat(key, " (").concat((_d = (_c = jobFileInputArray.sourceUrls) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : '0', " files)"), error: error }, "file-input-arrays-summary-".concat(key !== null && key !== void 0 ? key : uuidv4())));
            }), missingRequiredInputArrays.map(function (requiredFileInput) { return (_jsx(StepSummaryField, { error: "".concat(requiredFileInput.name, " is required") }, "file-inputs-arrays-required-error-".concat(requiredFileInput.name))); }), includedByDefault.map(function (defaultInput) { return (_jsx(StepSummaryField, { field: "".concat(defaultInput.name, " included by default") }, "file-input-arrays-default-".concat(defaultInput.name))); })] }, "file-input-arrays-summary"));
};
var validationSchema = Yup.object().shape({
    fileInputArrays: Yup.array().of(Yup.object().shape({
        name: Yup.string().min(1).required('A fileInputArray name is required'),
        sourceUrls: Yup.array(Yup.string().min(1).required('A sourceUrl is required')).min(1),
        targetDir: Yup.string().min(1).required('A targetDir is required'),
    })),
});
var step = {
    id: 'fileInputArrays',
    name: 'File Input Arrays',
    render: _jsx(FileInputArrays, {}),
    summary: _jsx(FileInputArraysSummary, {}),
    validationSchema: validationSchema,
    generateInitialValues: function (_a) {
        var job = _a.job;
        return ({
            fileInputArrays: job.fileInputArrays,
        });
    },
};
export default step;
