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
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { DescriptionList, Tabs, JSONDisplay } from 'ui';
import { QueryWrapper } from 'wrappers';
var PodDetail = function (_a) {
    var podId = _a.podId;
    var _b = Hooks.useDetails({
        podId: podId,
    }), data = _b.data, isLoading = _b.isLoading, error = _b.error;
    var _c = Hooks.useLogs({
        podId: podId,
    }), data2 = _c.data, isLoading2 = _c.isLoading, error2 = _c.error;
    var pod = data === null || data === void 0 ? void 0 : data.result;
    var podLogs = data2 === null || data2 === void 0 ? void 0 : data2.result;
    return (_jsxs(QueryWrapper, __assign({ isLoading: isLoading || isLoading2, error: error || error2 }, { children: [_jsx("h3", { children: pod === null || pod === void 0 ? void 0 : pod.pod_id }), pod && (_jsx(Tabs, { tabs: {
                    Definition: (_jsx(JSONDisplay, { json: pod, tooltipTitle: "Pod Definition", tooltipText: "This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods" })),
                    Details: _jsx(DescriptionList, { data: pod }),
                    Logs: (_jsx(JSONDisplay, { json: podLogs === null || podLogs === void 0 ? void 0 : podLogs.logs, checkbox: false, jsonstringify: false, tooltipTitle: "Logs", tooltipText: "Logs contain the stdout/stderr of the most recent Pod run. Use it to debug your pod during startup, to grab metrics, inspect logs, and output data from your Pod." })),
                    'Action Logs': (_jsx(JSONDisplay, { json: podLogs === null || podLogs === void 0 ? void 0 : podLogs.action_logs, checkbox: false, jsonstringify: true, tooltipTitle: "Action Logs", tooltipText: "Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here." })),
                } }))] })));
};
export default PodDetail;
