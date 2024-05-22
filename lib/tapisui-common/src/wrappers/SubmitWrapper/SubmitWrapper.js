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
import { LoadingSpinner, Message } from 'ui';
import styles from './SubmitWrapper.module.scss';
var SubmitWrapper = function (_a) {
    var _b;
    var isLoading = _a.isLoading, error = _a.error, success = _a.success, children = _a.children, _c = _a.className, className = _c === void 0 ? '' : _c, _d = _a.reverse, reverse = _d === void 0 ? false : _d;
    return (_jsxs("div", __assign({ className: "".concat(className, " ").concat(styles.wrapper, " ").concat(reverse && styles.reverse) }, { children: [children, isLoading && (_jsx(LoadingSpinner, { className: styles['loading-spinner'], placement: "inline" })), error ? (_jsx(Message, __assign({ canDismiss: false, type: "error", scope: "inline" }, { children: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error }))) : (success && (_jsx(Message, __assign({ canDismiss: false, type: "success", scope: "inline" }, { children: success }))))] })));
};
export default SubmitWrapper;
