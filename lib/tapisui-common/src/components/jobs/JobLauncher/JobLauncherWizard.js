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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo } from 'react';
import { QueryWrapper, Wizard } from 'wrappers';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import generateJobDefaults from 'utils/jobDefaults';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { useJobLauncher, JobLauncherProvider } from './components';
import jobSteps from './steps';
export var JobLauncherWizardRender = function (_a) {
    var jobSteps = _a.jobSteps;
    var _b = useJobLauncher(), add = _b.add, job = _b.job, app = _b.app, systems = _b.systems;
    var formSubmit = useCallback(function (value) {
        if (value.jobType === Apps.JobTypeEnum.Fork) {
            value.execSystemLogicalQueue = undefined;
        }
        if (value.isMpi) {
            value.cmdPrefix = undefined;
        }
        else {
            value.mpiCmd = undefined;
        }
        if (value.parameterSet) {
            value.parameterSet = __assign(__assign({}, job.parameterSet), value.parameterSet);
        }
        add(value);
    }, [add, job]);
    // Map Array of JobSteps into an array of WizardSteps
    var steps = useMemo(function () {
        return jobSteps.map(function (jobStep) {
            var generateInitialValues = jobStep.generateInitialValues, validateThunk = jobStep.validateThunk, stepProps = __rest(jobStep, ["generateInitialValues", "validateThunk"]);
            return __assign({ initialValues: generateInitialValues({ job: job, app: app, systems: systems }), 
                // generate a validation function from the JobStep's validateThunk, given the current hook values
                validate: validateThunk
                    ? validateThunk({ job: job, app: app, systems: systems })
                    : undefined }, stepProps);
        });
    }, [app, job, systems, jobSteps]);
    return (_jsx(Wizard, { steps: steps, memo: "".concat(app.id).concat(app.version), formSubmit: formSubmit }));
};
var JobLauncherWizard = function (_a) {
    var appId = _a.appId, appVersion = _a.appVersion;
    var _b = AppsHooks.useDetail({ appId: appId, appVersion: appVersion }, { refetchOnWindowFocus: false }), data = _b.data, isLoading = _b.isLoading, error = _b.error;
    var _c = SystemsHooks.useList({ select: 'allAttributes' }, { refetchOnWindowFocus: false }), systemsData = _c.data, systemsIsLoading = _c.isLoading, systemsError = _c.error;
    var _d = SystemsHooks.useSchedulerProfiles({ refetchOnWindowFocus: false }), schedulerProfilesData = _d.data, schedulerProfilesIsLoading = _d.isLoading, schedulerProfilesError = _d.error;
    var app = data === null || data === void 0 ? void 0 : data.result;
    var systems = useMemo(function () { var _a; return (_a = systemsData === null || systemsData === void 0 ? void 0 : systemsData.result) !== null && _a !== void 0 ? _a : []; }, [systemsData]);
    var schedulerProfiles = useMemo(function () { var _a; return (_a = schedulerProfilesData === null || schedulerProfilesData === void 0 ? void 0 : schedulerProfilesData.result) !== null && _a !== void 0 ? _a : []; }, [schedulerProfilesData]);
    var defaultValues = useMemo(function () { return generateJobDefaults({ app: app, systems: systems }); }, [app, systems]);
    return (_jsx(QueryWrapper, __assign({ isLoading: isLoading || systemsIsLoading || schedulerProfilesIsLoading, error: error || systemsError || schedulerProfilesError }, { children: app && (_jsx(JobLauncherProvider, __assign({ value: { app: app, systems: systems, defaultValues: defaultValues, schedulerProfiles: schedulerProfiles } }, { children: _jsx(JobLauncherWizardRender, { jobSteps: jobSteps }) }))) })));
};
export default JobLauncherWizard;
