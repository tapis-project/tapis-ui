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
import FieldWrapper from 'ui/FieldWrapper';
import { Input, Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext, Field, ErrorMessage, } from 'formik';
import { InputGroup, InputGroupAddon } from 'reactstrap';
import { FormikCheck, FormikTapisFile, FormikSelect, } from 'ui-formik/FieldWrapperFormik';
import * as Yup from 'yup';
import formStyles from 'ui-formik/FieldWrapperFormik/FieldWrapperFormik.module.css';
var ArrayGroup = function (_a) {
    var values = _a.values, name = _a.name, label = _a.label, description = _a.description;
    return (_jsx(FieldArray, { name: name, render: function (arrayHelpers) { return (_jsx(Collapse, __assign({ open: values.length > 0, title: label, note: "".concat(values.length, " items"), isCollapsable: true, className: fieldArrayStyles.array }, { children: _jsxs(FieldWrapper, __assign({ label: label, required: false, description: description }, { children: [_jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: values.map(function (value, index) { return (_jsxs(_Fragment, { children: [_jsx(Field, __assign({ name: "".concat(name, ".").concat(index) }, { children: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(InputGroup, { children: [_jsx(Input, __assign({}, field, { bsSize: "sm" })), _jsx(InputGroupAddon, __assign({ addonType: "append" }, { children: _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); } }, { children: "Remove" })) }))] }));
                                    } })), _jsx(ErrorMessage, __assign({ name: "".concat(name, ".").concat(index), className: "form-field__help" }, { children: function (message) { return (_jsx("div", __assign({ className: "".concat(formStyles['form-field__help'], " ").concat(fieldArrayStyles.description) }, { children: message }))); } }))] })); }) })), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push(''); }, size: "sm" }, { children: "+ Add" }))] })) }))); } }));
};
var ArchiveFilterRender = function () {
    var _a, _b, _c, _d, _e, _f;
    var values = useFormikContext().values;
    var includes = (_c = (_b = (_a = values.parameterSet) === null || _a === void 0 ? void 0 : _a.archiveFilter) === null || _b === void 0 ? void 0 : _b.includes) !== null && _c !== void 0 ? _c : [];
    var excludes = (_f = (_e = (_d = values.parameterSet) === null || _d === void 0 ? void 0 : _d.archiveFilter) === null || _e === void 0 ? void 0 : _e.excludes) !== null && _f !== void 0 ? _f : [];
    return (_jsxs("div", { children: [_jsx("h3", { children: "Archive Filters" }), _jsx(ArrayGroup, { name: "parameterSet.archiveFilter.includes", label: "Includes", description: "File patterns specified here will be included during job archiving", values: includes }), _jsx(ArrayGroup, { name: "parameterSet.archiveFilter.excludes", label: "Excludes", description: "File patterns specified here will be excluded from job archiving", values: excludes }), _jsx(FormikCheck, { name: "parameterSet.archiveFilter.includeLaunchFiles", label: "Include Launch Files", description: "If checked, launch files will be included during job archiving", required: false })] }));
};
var ArchiveOptions = function () {
    var systems = useJobLauncher().systems;
    var values = useFormikContext().values;
    var archiveSystemId = useMemo(function () { return values.archiveSystemId; }, [values]);
    return (_jsx(_Fragment, { children: _jsxs("div", __assign({ className: fieldArrayStyles.item }, { children: [_jsxs(FormikSelect, __assign({ name: "archiveSystemId", label: "Archive System ID", description: "If selected, this system ID will be used for job archiving instead of the execution system default", required: false }, { children: [_jsx("option", { value: undefined }), systems.map(function (system) { return (_jsx("option", __assign({ value: system.id }, { children: system.id }), "archive-system-select-".concat(system.id))); })] })), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: archiveSystemId, disabled: !archiveSystemId, name: "archiveSystemDir", label: "Archive System Directory", description: "The directory on the selected system in which to place archived files", required: false, files: false, dirs: true }), _jsx(FormikCheck, { name: "archiveOnAppError", label: "Archive On App Error", description: "If checked, the job will be archived even if there is an execution error", required: false })] })) }));
};
export var Archive = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "Archive Options" }), _jsx(ArchiveOptions, {}), _jsx(ArchiveFilterRender, {})] }));
};
export var ArchiveSummary = function () {
    var _a, _b, _c, _d, _e, _f;
    var job = useJobLauncher().job;
    var includes = (_c = (_b = (_a = job.parameterSet) === null || _a === void 0 ? void 0 : _a.archiveFilter) === null || _b === void 0 ? void 0 : _b.includes) !== null && _c !== void 0 ? _c : [];
    var excludes = (_f = (_e = (_d = job.parameterSet) === null || _d === void 0 ? void 0 : _d.archiveFilter) === null || _e === void 0 ? void 0 : _e.excludes) !== null && _f !== void 0 ? _f : [];
    var archiveSystemId = job.archiveSystemId, archiveSystemDir = job.archiveSystemDir, archiveOnAppError = job.archiveOnAppError;
    return (_jsxs("div", { children: [_jsx(StepSummaryField, { field: "Archive System ID: ".concat(archiveSystemId !== null && archiveSystemId !== void 0 ? archiveSystemId : 'default') }, "archive-system-id-summary"), _jsx(StepSummaryField, { field: "Archive System Directory: ".concat(archiveSystemDir !== null && archiveSystemDir !== void 0 ? archiveSystemDir : 'default') }, "archive-system-dir-summary"), _jsx(StepSummaryField, { field: "Archive On App Error: ".concat(archiveOnAppError) }, "archive-on-app-error-summary"), _jsx(StepSummaryField, { field: "Includes: ".concat(includes.length) }, "archive-filter-includes-summary"), _jsx(StepSummaryField, { field: "Excludes: ".concat(excludes.length) }, "archive-filter-excludes-summary")] }));
};
var validationSchema = Yup.object().shape({
    archiveOnAppError: Yup.boolean(),
    archiveSystemId: Yup.string(),
    archiveSystemDir: Yup.string(),
    parameterSet: Yup.object({
        archiveFilter: Yup.object({
            includes: Yup.array(Yup.string()
                .min(1)
                .required('A pattern must be specified for this include')),
            excludes: Yup.array(Yup.string()
                .min(1)
                .required('A pattern must be specified for this exclude')),
            includeLaunchFiles: Yup.boolean(),
        }),
    }),
});
var step = {
    id: 'archiving',
    name: 'Archiving',
    render: _jsx(Archive, {}),
    summary: _jsx(ArchiveSummary, {}),
    validationSchema: validationSchema,
    generateInitialValues: function (_a) {
        var _b;
        var job = _a.job;
        return ({
            archiveOnAppError: job.archiveOnAppError,
            archiveSystemId: job.archiveSystemId,
            archiveSystemDir: job.archiveSystemDir,
            parameterSet: {
                archiveFilter: (_b = job.parameterSet) === null || _b === void 0 ? void 0 : _b.archiveFilter,
            },
        });
    },
};
export default step;
