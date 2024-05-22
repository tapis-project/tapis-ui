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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'reactstrap';
import styles from './Breadcrumbs.module.scss';
var BreadcrumbFragment = function (_a) {
    var to = _a.to, onClick = _a.onClick, text = _a.text;
    if (onClick) {
        return (_jsxs("span", __assign({ className: styles.fragment }, { children: [' ', _jsx(Button, __assign({ color: "link", className: styles.link, onClick: function (e) {
                        e.preventDefault();
                        to && onClick(to);
                    } }, { children: text })), "\u00A0/\u00A0"] })));
    }
    if (to) {
        return (_jsxs("span", __assign({ className: styles.fragment }, { children: [_jsx(NavLink, __assign({ to: to }, { children: text })), "\u00A0/\u00A0"] })));
    }
    return (_jsxs("span", __assign({ className: styles.fragment }, { children: [text, "\u00A0", "".concat(text !== '...' ? '/' : ''), "\u00A0"] })));
};
var Breadcrumbs = function (_a) {
    var breadcrumbs = _a.breadcrumbs, truncate = _a.truncate;
    var truncatedBreadcrumbs = breadcrumbs;
    if (truncate && breadcrumbs.length >= 5) {
        // First 2 breadcrumbs
        truncatedBreadcrumbs = __spreadArray([], breadcrumbs.slice(0, 2), true);
        // Ellipsis representing truncated breadcrumbs
        truncatedBreadcrumbs.push({ text: '\u2026' });
        // Last 2 breadcrumbs
        truncatedBreadcrumbs.push.apply(truncatedBreadcrumbs, breadcrumbs.slice(breadcrumbs.length - 2, breadcrumbs.length));
    }
    return (_jsx("div", __assign({ className: styles.box }, { children: truncatedBreadcrumbs.map(function (item, index) {
            var text = item.text, to = item.to, onClick = item.onClick;
            if (index === truncatedBreadcrumbs.length - 1) {
                return _jsx(BreadcrumbFragment, { text: text }, uuidv4());
            }
            return (_jsx(BreadcrumbFragment, { text: text, to: to, onClick: onClick }, uuidv4()));
        }) })));
};
export default Breadcrumbs;
