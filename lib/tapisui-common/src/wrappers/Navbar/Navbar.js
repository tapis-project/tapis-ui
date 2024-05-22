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
import { NavLink } from 'react-router-dom';
import { Icon } from 'ui';
import styles from './Navbar.module.scss';
export var NavItem = function (_a) {
    var to = _a.to, icon = _a.icon, children = _a.children;
    return (_jsx(NavLink, __assign({ to: to, className: styles['nav-link'], activeClassName: styles['active'], exact: to === '/' }, { children: _jsxs("div", __assign({ className: styles['nav-content'] }, { children: [icon && _jsx(Icon, { name: icon }), _jsx("span", __assign({ className: styles['nav-text'] }, { children: children }))] })) })));
};
var Navbar = function (_a) {
    var children = _a.children;
    return _jsx("div", __assign({ className: "".concat(styles['nav-list']) }, { children: children }));
};
export default Navbar;
