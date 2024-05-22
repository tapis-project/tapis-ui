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
import { FieldArray, useField } from 'formik';
import { ArgField } from './Args';
var SchedulerOptionArray = function () {
    var field = useField('jobAttributes.parameterSet.schedulerOptions')[0];
    var args = useMemo(function () { var _a; return (_a = field.value) !== null && _a !== void 0 ? _a : []; }, [field]);
    return (_jsx(FieldArray, { name: "jobAttributes.parameterSet.schedulerOptions", render: function (arrayHelpers) { return (_jsx(_Fragment, { children: _jsxs("div", __assign({ className: fieldArrayStyles.array }, { children: [_jsx("h3", { children: "Scheduler Arguments" }), _jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: args.map(function (arg, index) {
                            return (_jsx(ArgField, { index: index, arrayHelpers: arrayHelpers, name: "jobAttributes.parameterSet.schedulerOptions.".concat(index), argType: 'scheduler option', inputMode: undefined }));
                        }) })), _jsx(Button, __assign({ onClick: function () {
                            return arrayHelpers.push({
                                name: '',
                                description: '',
                                include: true,
                                arg: '',
                            });
                        }, size: "sm" }, { children: "+ Add" }))] })) })); } }));
};
export var SchedulerOptions = function () {
    return (_jsx("div", { children: _jsx(SchedulerOptionArray, {}) }));
};
export default SchedulerOptions;
