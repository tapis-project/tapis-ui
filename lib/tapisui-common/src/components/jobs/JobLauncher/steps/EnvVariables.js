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
import { useMemo } from 'react';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext, useField, } from 'formik';
import { FormikInput } from 'ui-formik/FieldWrapperFormik';
import * as Yup from 'yup';
var EnvVariableField = function (_a) {
    var index = _a.index, arrayHelpers = _a.arrayHelpers;
    var field = useField("parameterSet.envVariables.".concat(index, ".key"))[0];
    var key = useMemo(function () { return field.value; }, [field]);
    return (_jsxs(Collapse, __assign({ title: !!key && key.length ? key : 'Environment Variable', className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "parameterSet.envVariables.".concat(index, ".key"), required: true, label: "Key", description: "The key name for this environment variable" }), _jsx(FormikInput, { name: "parameterSet.envVariables.".concat(index, ".value"), required: true, label: "Value", description: "A value for this environment variable" }), _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); } }, { children: "Remove" }))] }), "envVariables.".concat(index)));
};
var EnvVariablesRender = function () {
    var _a, _b;
    var values = useFormikContext().values;
    var envVariables = (_b = (_a = values.parameterSet) === null || _a === void 0 ? void 0 : _a.envVariables) !== null && _b !== void 0 ? _b : [];
    return (_jsx(FieldArray, { name: 'parameterSet.envVariables', render: function (arrayHelpers) { return (_jsxs("div", { children: [_jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: envVariables.map(function (envVariable, index) { return (_jsx(EnvVariableField, { index: index, arrayHelpers: arrayHelpers })); }) })), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push({ key: '', value: '' }); }, size: "sm" }, { children: "+ Add" }))] })); } }));
};
export var EnvVariables = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "Environment Variables" }), _jsx(EnvVariablesRender, {})] }));
};
export var EnvVariablesSummary = function () {
    var _a, _b;
    var job = useJobLauncher().job;
    var envVariables = (_b = (_a = job.parameterSet) === null || _a === void 0 ? void 0 : _a.envVariables) !== null && _b !== void 0 ? _b : [];
    return (_jsx("div", { children: envVariables.map(function (envVariable) { return (_jsx(StepSummaryField, { field: "".concat(envVariable.key, " : ").concat(envVariable.value) }, "env-variables-summary-".concat(envVariable.key))); }) }));
};
var validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
        envVariables: Yup.array(Yup.object({
            key: Yup.string()
                .min(1)
                .required('A key name is required for this environment variable'),
            value: Yup.string().required('A value is required for this environment variable'),
        })),
    }),
});
var step = {
    id: 'envVariables',
    name: 'Environment Variables',
    render: _jsx(EnvVariables, {}),
    summary: _jsx(EnvVariablesSummary, {}),
    validationSchema: validationSchema,
    generateInitialValues: function (_a) {
        var _b;
        var job = _a.job;
        return ({
            parameterSet: {
                envVariables: (_b = job.parameterSet) === null || _b === void 0 ? void 0 : _b.envVariables,
            },
        });
    },
};
export default step;
