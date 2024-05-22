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
import styles from './Progress.module.scss';
var Progress = function (_a) {
    var value = _a.value, color = _a.color, _b = _a.showProgress, showProgress = _b === void 0 ? true : _b;
    var style = {
        '--width': "".concat(value, "%"),
    };
    return (_jsxs("div", __assign({ className: styles['progress-bar'] }, { children: [_jsx("div", { className: styles['inner-bar'], style: style }), showProgress && (_jsx("div", __assign({ className: styles['overlay'] }, { children: _jsxs("p", { children: [value, "%"] }) })))] })));
};
export default Progress;
