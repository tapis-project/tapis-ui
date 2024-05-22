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
import { FieldWrapper } from 'ui';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext, Field, ErrorMessage, } from 'formik';
import { InputGroup, InputGroupAddon } from 'reactstrap';
import { FormikCheck, FormikTapisFile, FormikSelect, } from 'ui-formik/FieldWrapperFormik';
import formStyles from 'ui-formik/FieldWrapperFormik/FieldWrapperFormik.module.css';
import { Systems } from '@tapis/tapisui-hooks';
import { ListTypeEnum } from '@tapis/tapis-typescript-systems';
var ArrayGroup = function (_a) {
    var values = _a.values, name = _a.name, label = _a.label, description = _a.description;
    return (_jsx(FieldArray, { name: name, render: function (arrayHelpers) { return (_jsx(Collapse, __assign({ open: values.length > 0, title: label, note: "".concat(values.length, " items"), isCollapsable: true, className: fieldArrayStyles.array }, { children: _jsxs(FieldWrapper, __assign({ label: label, required: false, description: description }, { children: [_jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: values.map(function (value, index) { return (_jsxs(_Fragment, { children: [_jsx(Field, __assign({ name: "".concat(name, ".").concat(index) }, { children: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(InputGroup, { children: [_jsx(Input, __assign({}, field, { bsSize: "sm" })), _jsx(InputGroupAddon, __assign({ addonType: "append" }, { children: _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); } }, { children: "Remove" })) }))] }));
                                    } })), _jsx(ErrorMessage, __assign({ name: "".concat(name, ".").concat(index), className: "form-field__help" }, { children: function (message) { return (_jsx("div", __assign({ className: "".concat(formStyles['form-field__help'], " ").concat(fieldArrayStyles.description) }, { children: message }))); } }))] })); }) })), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push(''); }, size: "sm" }, { children: "+ Add" }))] })) }))); } }));
};
var ArchiveFilterRender = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var values = useFormikContext().values;
    var includes = (_d = (_c = (_b = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.parameterSet) === null || _b === void 0 ? void 0 : _b.archiveFilter) === null || _c === void 0 ? void 0 : _c.includes) !== null && _d !== void 0 ? _d : [];
    var excludes = (_h = (_g = (_f = (_e = values.jobAttributes) === null || _e === void 0 ? void 0 : _e.parameterSet) === null || _f === void 0 ? void 0 : _f.archiveFilter) === null || _g === void 0 ? void 0 : _g.excludes) !== null && _h !== void 0 ? _h : [];
    return (_jsxs("div", { children: [_jsx("h3", { children: "Archive Filters" }), _jsx(ArrayGroup, { name: "jobAttributes.parameterSet.archiveFilter.includes", label: "Includes", description: "File patterns specified here will be included during job archiving", values: includes }), _jsx(ArrayGroup, { name: "jobAttributes.parameterSet.archiveFilter.excludes", label: "Excludes", description: "File patterns specified here will be excluded from job archiving", values: excludes }), _jsx(FormikCheck, { name: "jobAttributes.parameterSet.archiveFilter.includeLaunchFiles", label: "Include Launch Files", description: "If checked, launch files will be included during job archiving", required: false })] }));
};
var ArchiveOptions = function () {
    var _a, _b;
    var _c = Systems.useList({ listType: ListTypeEnum.All }), data = _c.data, isLoading = _c.isLoading, isError = _c.isError;
    var values = useFormikContext().values;
    if (isLoading)
        return _jsx("div", { children: "Loading systems..." });
    if (isError)
        return _jsx("div", { children: "Error loading systems." });
    var archiveSystemId = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.archiveSystemId;
    return (_jsx(_Fragment, { children: _jsxs("div", __assign({ className: fieldArrayStyles.item }, { children: [_jsxs(FormikSelect, __assign({ name: "jobAttributes.archiveSystemId", label: "Archive System ID", description: "If selected, this system ID will be used for job archiving instead of the execution system default", required: false }, { children: [_jsx("option", { value: undefined }), (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.map(function (system) { return (_jsx("option", __assign({ value: system.id }, { children: system.id }), "archive-system-select-".concat(system.id))); })] })), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: archiveSystemId, disabled: !archiveSystemId, name: "jobAttributes.archiveSystemDir", label: "Archive System Directory", description: "The directory on the selected system in which to place archived files", required: false, files: false, dirs: true }), _jsx(FormikCheck, { name: "jobAttributes.archiveOnAppError", label: "Archive On App Error", description: "If checked, the job will be archived even if there is an execution error", required: false })] })) }));
};
export var Archive = function () {
    return (_jsxs("div", { children: [_jsx(ArchiveOptions, {}), _jsx(ArchiveFilterRender, {})] }));
};
export default Archive;
