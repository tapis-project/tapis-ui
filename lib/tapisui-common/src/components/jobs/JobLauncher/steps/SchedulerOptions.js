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
import { useCallback, useMemo } from 'react';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useField, useFormikContext } from 'formik';
import { getArgMode } from 'utils/jobArgs';
import { ArgField, argsSchema, assembleArgSpec } from './AppArgs';
import { DescriptionList } from 'ui';
import * as Yup from 'yup';
import styles from './SchedulerOptions.module.scss';
var findSchedulerProfile = function (values) {
    var _a, _b, _c;
    // Look at current schedulerOptions
    var argSpecs = (_b = (_a = values.parameterSet) === null || _a === void 0 ? void 0 : _a.schedulerOptions) !== null && _b !== void 0 ? _b : [];
    // Find any scheduler option that has --tapis-profile set
    var profile = argSpecs.find(function (argSpec) { var _a; return (_a = argSpec.arg) === null || _a === void 0 ? void 0 : _a.includes('--tapis-profile'); });
    if (profile) {
        // Return the name of the profile after --tapis-profile
        var args = (_c = profile.arg) === null || _c === void 0 ? void 0 : _c.split(' ');
        if (args && args.length >= 2) {
            return args[1];
        }
    }
    return undefined;
};
var SchedulerProfiles = function () {
    var schedulerProfiles = useJobLauncher().schedulerProfiles;
    var _a = useFormikContext(), values = _a.values, setValues = _a.setValues;
    var setSchedulerProfile = useCallback(function (newProfile) {
        var _a, _b;
        var argSpecs = (_b = (_a = values.parameterSet) === null || _a === void 0 ? void 0 : _a.schedulerOptions) !== null && _b !== void 0 ? _b : [];
        setValues({
            parameterSet: {
                schedulerOptions: __spreadArray([
                    newProfile
                ], argSpecs.filter(function (existing) { var _a; return !((_a = existing.arg) === null || _a === void 0 ? void 0 : _a.includes('--tapis-profile')); }), true),
            },
        });
    }, [values, setValues]);
    var currentProfile = useMemo(function () { return findSchedulerProfile(values); }, [values]);
    return (_jsxs("div", __assign({ className: fieldArrayStyles.array }, { children: [_jsx("h3", { children: "Scheduler Profiles" }), schedulerProfiles.map(function (_a) {
                var name = _a.name, description = _a.description, hiddenOptions = _a.hiddenOptions, moduleLoads = _a.moduleLoads, owner = _a.owner, tenant = _a.tenant;
                return (_jsxs(Collapse, __assign({ className: fieldArrayStyles['array-group'], title: "".concat(name, " ").concat(name === currentProfile ? '(selected)' : '') }, { children: [_jsxs("div", __assign({ className: styles['scheduler-option'] }, { children: [_jsx("div", { children: description }), _jsx(DescriptionList, { data: {
                                        moduleLoads: moduleLoads,
                                        hiddenOptions: hiddenOptions,
                                        owner: owner,
                                        tenant: tenant,
                                    }, className: styles['scheduler-option-list'] })] })), _jsx(Button, __assign({ size: "sm", onClick: function () {
                                return setSchedulerProfile({
                                    name: "".concat(name, " Scheduler Profile"),
                                    description: description,
                                    include: true,
                                    arg: "--tapis-profile ".concat(name),
                                });
                            }, disabled: name === currentProfile }, { children: "Use This Profile" }))] }), "scheduler-profiles-".concat(name)));
            })] })));
};
var SchedulerOptionArray = function () {
    var app = useJobLauncher().app;
    var field = useField('parameterSet.schedulerOptions')[0];
    var args = useMemo(function () { var _a; return (_a = field.value) !== null && _a !== void 0 ? _a : []; }, [field]);
    var schedulerOptionSpecs = useMemo(function () { var _a, _b, _c; return (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.parameterSet) === null || _b === void 0 ? void 0 : _b.schedulerOptions) !== null && _c !== void 0 ? _c : []; }, [app]);
    return (_jsx(FieldArray, { name: "parameterSet.schedulerOptions", render: function (arrayHelpers) { return (_jsxs(_Fragment, { children: [_jsxs("div", __assign({ className: fieldArrayStyles.array }, { children: [_jsx("h3", { children: "Scheduler Arguments" }), _jsx("div", __assign({ className: fieldArrayStyles['array-group'] }, { children: args.map(function (arg, index) {
                                var inputMode = arg.name
                                    ? getArgMode(arg.name, schedulerOptionSpecs)
                                    : undefined;
                                return (_jsx(ArgField, { index: index, arrayHelpers: arrayHelpers, name: "parameterSet.schedulerOptions.".concat(index), argType: 'scheduler option', inputMode: inputMode }));
                            }) })), _jsx(Button, __assign({ onClick: function () {
                                return arrayHelpers.push({
                                    name: '',
                                    description: '',
                                    include: true,
                                    arg: '',
                                });
                            }, size: "sm" }, { children: "+ Add" }))] })), _jsx(SchedulerProfiles, {})] })); } }));
};
export var SchedulerOptions = function () {
    return (_jsxs("div", { children: [_jsx("h2", { children: "Scheduler Options" }), _jsx(SchedulerOptionArray, {})] }));
};
export var SchedulerOptionsSummary = function () {
    var _a, _b, _c;
    var job = useJobLauncher().job;
    var schedulerOptions = (_b = (_a = job.parameterSet) === null || _a === void 0 ? void 0 : _a.schedulerOptions) !== null && _b !== void 0 ? _b : [];
    return (_jsxs("div", { children: [_jsx(StepSummaryField, { field: "Scheduler Profile: ".concat((_c = findSchedulerProfile(job)) !== null && _c !== void 0 ? _c : 'none selected') }, "scheduler-profile-summary"), _jsx(StepSummaryField, { field: "Scheduler Args: ".concat(assembleArgSpec(schedulerOptions)) }, "scheduler-args-summary")] }));
};
var validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
        scheduleOptions: argsSchema,
    }),
});
var step = {
    id: 'schedulerOptions',
    name: 'Scheduler Options',
    render: _jsx(SchedulerOptions, {}),
    summary: _jsx(SchedulerOptionsSummary, {}),
    validationSchema: validationSchema,
    generateInitialValues: function (_a) {
        var _b;
        var job = _a.job;
        return ({
            parameterSet: {
                schedulerOptions: (_b = job.parameterSet) === null || _b === void 0 ? void 0 : _b.schedulerOptions,
            },
        });
    },
};
export default step;
