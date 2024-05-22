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
import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext } from 'react';
import withBuilder from 'utils/withBuilder';
var JobLauncherContext = React.createContext({
    app: {},
    systems: [],
    schedulerProfiles: [],
});
var _a = withBuilder(), useBuilderContext = _a.useBuilderContext, Provider = _a.Provider;
export var useJobLauncher = function () {
    var _a = useBuilderContext(), data = _a.data, add = _a.add, set = _a.set, clear = _a.clear;
    var _b = useContext(JobLauncherContext), app = _b.app, systems = _b.systems, schedulerProfiles = _b.schedulerProfiles;
    return {
        job: data,
        add: add,
        set: set,
        clear: clear,
        app: app,
        systems: systems,
        schedulerProfiles: schedulerProfiles,
    };
};
export var JobLauncherProvider = function (_a) {
    var value = _a.value, children = _a.children;
    var app = value.app, systems = value.systems, defaultValues = value.defaultValues, schedulerProfiles = value.schedulerProfiles;
    return (_jsx(JobLauncherContext.Provider, __assign({ value: { app: app, systems: systems, schedulerProfiles: schedulerProfiles } }, { children: Provider({ value: defaultValues, children: children }) })));
};
export default useJobLauncher;
