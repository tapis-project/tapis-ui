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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useCallback } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { Input, Button, FormGroup } from 'reactstrap';
import { generateFileInputArrayFromAppInput } from 'utils/jobFileInputArrays';
import { Collapse, Icon, FieldWrapper, useModal } from 'ui';
import { FileSelectModal } from 'components/files';
import { FieldArray, useFormikContext, Field, ErrorMessage, } from 'formik';
import { FormikInput, FormikTapisFileInput, } from 'ui-formik/FieldWrapperFormik';
import arrayStyles from './FileInputArrays.module.scss';
import styles from './FileInputs.module.scss';
import fieldArrayStyles from './FieldArray.module.scss';
import { useJobLauncher } from 'components/jobs/JobLauncher/components';
var SourceUrlsField = function (_a) {
    var fileInputArrayIndex = _a.fileInputArrayIndex, arrayHelpers = _a.arrayHelpers;
    var _b = useFormikContext(), values = _b.values, setFieldValue = _b.setFieldValue;
    var _c = useModal(), modal = _c.modal, open = _c.open, close = _c.close;
    var push = arrayHelpers.push;
    var sourceUrls = useMemo(function () {
        var _a, _b, _c, _d;
        return (_d = (_c = (_b = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) === null || _b === void 0 ? void 0 : _b[fileInputArrayIndex]) === null || _c === void 0 ? void 0 : _c.sourceUrls) !== null && _d !== void 0 ? _d : [];
    }, [values, fileInputArrayIndex]);
    var onSelect = useCallback(function (systemId, files) {
        files.forEach(function (file) {
            var newSourceUrl = "tapis://".concat(systemId !== null && systemId !== void 0 ? systemId : 'here').concat(file.path);
            if (!sourceUrls.some(function (sourceUrl) { return sourceUrl === newSourceUrl; })) {
                push(newSourceUrl);
            }
        });
    }, [push, sourceUrls]);
    var handleUrlChange = useCallback(function (index, event) {
        var newUrls = __spreadArray([], sourceUrls, true);
        newUrls[index] = event.target.value;
        setFieldValue("jobAttributes.fileInputArrays.".concat(fileInputArrayIndex, ".sourceUrls"), newUrls);
    }, [sourceUrls, setFieldValue, fileInputArrayIndex]);
    var addUrlField = function () {
        var newUrls = __spreadArray(__spreadArray([], sourceUrls, true), [''], false);
        setFieldValue("jobAttributes.fileInputArrays.".concat(fileInputArrayIndex, ".sourceUrls"), newUrls);
    };
    return (_jsxs(FormGroup, { children: [_jsx("div", __assign({ className: arrayStyles.sourceUrls }, { children: sourceUrls.map(function (url, index) { return (_jsxs("div", __assign({ className: arrayStyles.inputMargin }, { children: [_jsx(Field, __assign({ name: "jobAttributes.fileInputArrays.".concat(fileInputArrayIndex, ".sourceUrls.").concat(index) }, { children: function (_a) {
                                var field = _a.field;
                                return (_jsx(FormikTapisFileInput, __assign({}, field, { value: url, onChange: function (event) { return handleUrlChange(index, event); }, append: _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); }, disabled: sourceUrls.length === 1 && index === 0 }, { children: _jsx(Icon, { name: "close" }) })) })));
                            } })), _jsx(ErrorMessage, { name: "jobAttributes.fileInputArrays.".concat(fileInputArrayIndex, ".sourceUrls.").concat(index), className: "form-field__help" })] }), "sourceUrl-".concat(fileInputArrayIndex, "-").concat(index))); }) })), _jsxs("div", { children: [_jsx(Button, __assign({ size: "sm", style: { marginRight: '5px' }, onClick: addUrlField }, { children: "+ Add Source URL" })), _jsx(Button, __assign({ size: "sm", onClick: function () { return open(); } }, { children: "+ Browse for Files" }))] }), modal && _jsx(FileSelectModal, { toggle: close, onSelect: onSelect })] }));
};
var upperCaseFirstLetter = function (str) {
    var lower = str.toLowerCase();
    return "".concat(lower.slice(0, 1).toUpperCase()).concat(lower.slice(1));
};
var AppInputArrayField = function (_a) {
    var item = _a.item, index = _a.index, remove = _a.remove;
    var name = item.name, sourceUrls = item.sourceUrls;
    var inputMode = undefined;
    var isRequired = inputMode === Apps.FileInputModeEnum.Required;
    var note = "".concat(inputMode ? upperCaseFirstLetter(inputMode) : 'User Defined');
    return (_jsxs(Collapse, __assign({ open: !sourceUrls, title: name !== null && name !== void 0 ? name : 'File Input Array', note: note, className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "jobAttributes.fileInputArrays.".concat(index, ".name"), label: "Name", required: true, description: "".concat(isRequired
                    ? 'This input is required and cannot be renamed'
                    : 'Name of this input'), disabled: isRequired }), _jsx(FieldArray, { name: "jobAttributes.fileInputArrays.".concat(index, ".sourceUrls"), render: function (arrayHelpers) { return (_jsx(FieldWrapper, __assign({ label: "Source URLs", required: true, 
                    // eslint-disable-next-line no-template-curly-in-string
                    description: "Input TAPIS files as pathnames, TAPIS URIs or web URLs\n            in the form of: 'tapis://systemId.path...'\n            " }, { children: _jsx(SourceUrlsField, { fileInputArrayIndex: index, arrayHelpers: arrayHelpers }) }))); } }), _jsx(FormikInput, { name: "jobAttributes.fileInputArrays.".concat(index, ".targetDir"), label: "Target Directory", required: true, description: "File mount path inside of running container" }), _jsx(FormikInput, { name: "jobAttributes.fileInputArrays.".concat(index, ".description"), label: "Description", required: false, description: "Description of this input" }), !isRequired && (_jsx(Button, __assign({ onClick: function () {
                    console.log('Remove index', index);
                    remove(index);
                }, size: "sm" }, { children: "Remove" })))] })));
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
    var _b, _c;
    var arrayHelpers = _a.arrayHelpers;
    var app = useJobLauncher().app;
    var values = useFormikContext().values;
    var optionalInputArrays = useMemo(function () { return getFileInputArraysOfMode(app, Apps.FileInputModeEnum.Optional); }, 
    /* eslint-disable-next-line */
    [app.id, app.version]);
    var formFileInputArrays = (_c = (_b = values === null || values === void 0 ? void 0 : values.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputArrays) !== null && _c !== void 0 ? _c : [];
    return !!optionalInputArrays.length ? (_jsxs(Collapse, __assign({ title: "Optional File Input Arrays", open: true, note: "".concat(optionalInputArrays.length, " additional files"), className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs are defined in the application and can be included with your job." })), optionalInputArrays.map(function (optionalInputArray) {
                var alreadyIncluded = inputArrayIncluded(optionalInputArray, formFileInputArrays);
                var onInclude = function () {
                    arrayHelpers.push(generateFileInputArrayFromAppInput(optionalInputArray));
                };
                return (_jsx("div", __assign({ className: fieldArrayStyles.item }, { children: _jsx(OptionalInputArray, { inputArray: optionalInputArray, onInclude: onInclude, included: alreadyIncluded }) }), "optional-input-array-".concat(optionalInputArray.name)));
            })] }))) : null;
};
var AppInputArrays = function (_a) {
    var _b, _c;
    var arrayHelpers = _a.arrayHelpers;
    var _d = useFormikContext(), values = _d.values, setFieldValue = _d.setFieldValue;
    var requiredText = '';
    var appInputArrays = (_c = (_b = values === null || values === void 0 ? void 0 : values.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputArrays) !== null && _c !== void 0 ? _c : [];
    return (_jsxs(Collapse, __assign({ open: false, title: "File Inputs Arrays", note: "".concat(appInputArrays.length, " items"), requiredText: requiredText, isCollapsable: true, className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Input Arrays will be submitted with your job." })), appInputArrays.map(function (appInputArray, index) { return (_jsx(AppInputArrayField, { item: appInputArray, index: index, remove: arrayHelpers.remove }, "render-fileInputArrays.".concat(index))); }), _jsx(Button, __assign({ onClick: function () {
                    var _a;
                    var fileInputArrays = ((_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) || [];
                    var newFileInputArray = { sourceUrls: [''] };
                    var newFileInputArrays = __spreadArray(__spreadArray([], fileInputArrays, true), [newFileInputArray], false);
                    setFieldValue('jobAttributes.fileInputArrays', newFileInputArrays);
                }, size: "sm" }, { children: "+ Add File Input Array" }))] })));
};
export var FileInputArrays = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "File Input Arrays" }), _jsx(FieldArray, { name: "jobAttributes.fileInputArrays", render: function (arrayHelpers) {
                    return (_jsxs(_Fragment, { children: [_jsx(AppInputArrays, { arrayHelpers: arrayHelpers }), _jsx(OptionalInputArrays, { arrayHelpers: arrayHelpers })] }));
                } })] }));
};
export default FileInputArrays;
