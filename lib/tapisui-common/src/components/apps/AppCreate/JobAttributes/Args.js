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
import { Apps } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useField, useFormikContext, } from 'formik';
import { FormikCheck, FormikInput } from 'ui-formik/FieldWrapperFormik';
import { getArgMode } from 'utils/jobArgs';
import * as Yup from 'yup';
export var ArgField = function (_a) {
    var index = _a.index, name = _a.name, argType = _a.argType, arrayHelpers = _a.arrayHelpers, inputMode = _a.inputMode;
    var field = useField("".concat(name, ".name"))[0];
    var argName = useMemo(function () { return field.value; }, [field]);
    return (_jsxs(Collapse, __assign({ title: !!argName && argName.length ? argName : argType, className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "".concat(name, ".name"), required: true, label: "Name", disabled: !!inputMode, description: "The name for this ".concat(argType, " ").concat(!!inputMode
                    ? 'is defined in the application and cannot be changed'
                    : '') }), _jsx(FormikInput, { name: "".concat(name, ".arg"), required: true, label: "Value", disabled: inputMode === Apps.ArgInputModeEnum.Fixed, description: "A value for this ".concat(argType) }), _jsx(FormikInput, { name: "".concat(name, ".description"), required: false, label: "Description", disabled: inputMode === Apps.ArgInputModeEnum.Fixed, description: "A description for this ".concat(argType) }), _jsx(FormikCheck, { name: "".concat(name, ".include"), required: false, label: "Include", disabled: inputMode === Apps.ArgInputModeEnum.Fixed ||
                    inputMode === Apps.ArgInputModeEnum.Required, description: inputMode === Apps.ArgInputModeEnum.Fixed ||
                    inputMode === Apps.ArgInputModeEnum.Required
                    ? "This ".concat(argType, " must be included")
                    : "If checked, this ".concat(argType, " will be included") }), _jsx(Button, __assign({ size: "sm", onClick: function () { return arrayHelpers.remove(index); } }, { children: "Remove" }))] }), "".concat(argType, ".").concat(index)));
};
export var ArgsFieldArray = function (_a) {
    var argSpecs = _a.argSpecs, name = _a.name, argType = _a.argType;
    var field = useField(name)[0];
    var args = useMemo(function () { var _a; return (_a = field.value) !== null && _a !== void 0 ? _a : []; }, [field]);
    return (_jsx(FieldArray, { name: name, render: function (arrayHelpers) { return (_jsxs("div", __assign({ className: fieldArrayStyles.array }, { children: [_jsx("h3", { children: "".concat(argType, "s") }), _jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: args.map(function (arg, index) {
                        var inputMode = arg.name
                            ? getArgMode(arg.name, argSpecs)
                            : undefined;
                        return (_jsx(ArgField, { index: index, arrayHelpers: arrayHelpers, name: "".concat(name, ".").concat(index), argType: argType, inputMode: inputMode }));
                    }) })), _jsx(Button, __assign({ onClick: function () {
                        return arrayHelpers.push({
                            include: true,
                        });
                    }, size: "sm" }, { children: "+ Add" }))] }))); } }));
};
export var argsSchema = Yup.array(Yup.object({
    name: Yup.string(),
    description: Yup.string(),
    include: Yup.boolean(),
    arg: Yup.string().min(1).required('The argument cannot be blank'),
}));
export var Args = function () {
    var values = useFormikContext().values;
    var appArgSpecs = useMemo(function () {
        var _a, _b, _c;
        return (_c = (_b = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.parameterSet) === null || _b === void 0 ? void 0 : _b.appArgs) !== null && _c !== void 0 ? _c : [];
    }, [values]);
    var containerArgSpecs = useMemo(function () {
        var _a, _b, _c;
        return (_c = (_b = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.parameterSet) === null || _b === void 0 ? void 0 : _b.containerArgs) !== null && _c !== void 0 ? _c : [];
    }, [values]);
    return (_jsxs("div", { children: [_jsx(ArgsFieldArray, { name: "jobAttributes.parameterSet.appArgs", argType: "App Argument", argSpecs: appArgSpecs }), _jsx(ArgsFieldArray, { name: "jobAttributes.parameterSet.containerArgs", argType: "Container Argument", argSpecs: containerArgSpecs })] }));
};
export var assembleArgSpec = function (argSpecs) {
    return argSpecs.reduce(function (previous, current) {
        return "".concat(previous).concat(current.include ? " ".concat(current.arg) : "");
    }, '');
};
export default _jsx(Args, {});
