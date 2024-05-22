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
import { LoadingSpinner, Message } from 'ui';
var QueryWrapper = function (_a) {
    var _b;
    var isLoading = _a.isLoading, error = _a.error, children = _a.children, _c = _a.className, className = _c === void 0 ? '' : _c;
    if (isLoading) {
        return (_jsx("div", __assign({ className: className }, { children: _jsx(LoadingSpinner, {}) })));
    }
    if (error) {
        return (_jsx("div", __assign({ className: className }, { children: _jsx(Message, __assign({ canDismiss: false, type: "error", scope: "inline" }, { children: (_b = error.message) !== null && _b !== void 0 ? _b : error })) })));
    }
    return _jsx("div", __assign({ className: className }, { children: children }));
};
export default QueryWrapper;
