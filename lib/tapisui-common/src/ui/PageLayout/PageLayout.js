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
import { jsxs as _jsxs } from "react/jsx-runtime";
import styles from './PageLayout.module.scss';
var Layout = function (_a) {
    var left = _a.left, right = _a.right, top = _a.top, bottom = _a.bottom, constrain = _a.constrain;
    return (_jsxs("div", __assign({ className: "".concat(styles['layout-root'], " ").concat(constrain ? styles.constrain : '') }, { children: [top, _jsxs("div", __assign({ className: "".concat(styles['layout-row'], " ").concat(constrain ? styles.constrain : '') }, { children: [left, right] })), bottom] })));
};
export default Layout;
