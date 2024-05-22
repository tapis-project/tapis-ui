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
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { DescriptionList } from 'ui';
import { QueryWrapper } from 'wrappers';
var SystemDetail = function (_a) {
    var _b;
    var transferTaskId = _a.transferTaskId, _c = _a.className, className = _c === void 0 ? '' : _c;
    var _d = Hooks.Transfers.useDetails(transferTaskId), data = _d.data, isLoading = _d.isLoading, error = _d.error;
    var task = data === null || data === void 0 ? void 0 : data.result;
    return (_jsxs(QueryWrapper, __assign({ isLoading: isLoading, error: error, className: className }, { children: [_jsx("h3", { children: (_b = task === null || task === void 0 ? void 0 : task.tag) !== null && _b !== void 0 ? _b : task === null || task === void 0 ? void 0 : task.id }), task && _jsx(DescriptionList, { data: task })] })));
};
export default SystemDetail;
