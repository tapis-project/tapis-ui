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
import { Message } from 'ui';
var JobStartSummary = function (_a) {
    var field = _a.field, error = _a.error;
    return (_jsx("div", { children: field ? (_jsx("div", { children: field })) : (_jsx(Message, __assign({ type: "error", canDismiss: false, scope: "inline" }, { children: error !== null && error !== void 0 ? error : '' }))) }));
};
export default JobStartSummary;
