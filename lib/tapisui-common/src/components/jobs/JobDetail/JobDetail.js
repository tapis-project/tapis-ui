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
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { DescriptionList } from 'ui';
import { QueryWrapper } from 'wrappers';
var JobDetail = function (_a) {
    var jobUuid = _a.jobUuid;
    var _b = Hooks.useDetails(jobUuid), data = _b.data, isLoading = _b.isLoading, error = _b.error;
    var job = data === null || data === void 0 ? void 0 : data.result;
    // console.log(job?.execSystemOutputDir);
    return (_jsxs(QueryWrapper, __assign({ isLoading: isLoading, error: error }, { children: [_jsx("h3", { children: job === null || job === void 0 ? void 0 : job.name }), _jsx("h5", { children: job === null || job === void 0 ? void 0 : job.uuid }), job && _jsx(DescriptionList, { data: job })] })));
};
export default JobDetail;
