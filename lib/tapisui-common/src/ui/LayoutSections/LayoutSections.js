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
import { SectionHeader as CommonSectionHeader } from 'ui';
import styles from './LayoutSections.module.scss';
export var LayoutHeader = function (_a) {
    var children = _a.children, type = _a.type;
    return (_jsx("div", __assign({ className: type && styles[type] }, { children: _jsx(CommonSectionHeader, { children: children }) })));
};
export var LayoutNavWrapper = function (_a) {
    var children = _a.children;
    return _jsx("div", __assign({ className: styles.nav }, { children: children }));
};
export var LayoutBody = function (_a) {
    var children = _a.children, constrain = _a.constrain;
    return (_jsx("div", __assign({ className: "".concat(styles.body, " ").concat(constrain ? styles.constrain : '') }, { children: _jsx("div", __assign({ className: styles.detail }, { children: children })) })));
};
