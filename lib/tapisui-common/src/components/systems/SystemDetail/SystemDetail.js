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
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { DescriptionList, Tabs, JSONDisplay } from 'ui';
import { QueryWrapper } from 'wrappers';
var SystemDetail = function (_a) {
    var systemId = _a.systemId;
    var _b = Hooks.useDetails({
        systemId: systemId,
        select: 'allAttributes',
    }), data = _b.data, isLoading = _b.isLoading, error = _b.error;
    var system = data === null || data === void 0 ? void 0 : data.result;
    return (_jsxs(QueryWrapper, __assign({ isLoading: isLoading, error: error }, { children: [_jsx("h3", { children: system === null || system === void 0 ? void 0 : system.id }), system && (_jsx(Tabs, { tabs: {
                    Details: _jsx(DescriptionList, { data: system }),
                    JSON: _jsx(JSONDisplay, { json: system }),
                } }))] })));
};
export default SystemDetail;
