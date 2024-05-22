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
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext, useField, } from 'formik';
import { FormikInput } from 'ui-formik/FieldWrapperFormik';
var EnvVariableField = function (_a) {
    var index = _a.index, arrayHelpers = _a.arrayHelpers;
    var field = useField("jobAttributes.parameterSet.envVariables.".concat(index, ".key"))[0];
    var key = useMemo(function () { return field.value; }, [field]);
    return (_jsxs(Collapse, __assign({ title: !!key && key.length ? key : 'Environment Variable', className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "jobAttributes.parameterSet.envVariables.".concat(index, ".key"), required: true, label: "Key", description: "The key name for this environment variable" }), _jsx(FormikInput, { name: "jobAttributes.parameterSet.envVariables.".concat(index, ".value"), required: true, label: "Value", description: "A value for this environment variable" }), _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); } }, { children: "Remove" }))] }), "envVariables.".concat(index)));
};
var EnvVariablesRender = function () {
    var _a, _b, _c;
    var values = useFormikContext().values;
    var envVariables = (_c = (_b = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.parameterSet) === null || _b === void 0 ? void 0 : _b.envVariables) !== null && _c !== void 0 ? _c : [];
    return (_jsx(FieldArray, { name: 'jobAttributes.parameterSet.envVariables', render: function (arrayHelpers) { return (_jsx(_Fragment, { children: _jsxs("div", __assign({ className: fieldArrayStyles.array }, { children: [_jsx("h3", { children: "Environment Variables" }), _jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: envVariables.map(function (envVariable, index) { return (_jsx(EnvVariableField, { index: index, arrayHelpers: arrayHelpers })); }) })), _jsx(Button, __assign({ onClick: function () {
                            return arrayHelpers.push({
                                key: '',
                                value: '',
                                description: '',
                                arg: '',
                            });
                        }, size: "sm" }, { children: "+ Add" }))] })) })); } }));
};
export var EnvVariables = function () {
    return (_jsx("div", { children: _jsx(EnvVariablesRender, {}) }));
};
export default EnvVariables;
