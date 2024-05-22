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
import { useState, useCallback } from 'react';
import { Button, Badge } from 'reactstrap';
import { Collapse as BootstrapCollapse } from 'reactstrap';
import { Icon } from 'ui';
import styles from './Collapse.module.scss';
var Collapse = function (_a) {
    var title = _a.title, note = _a.note, open = _a.open, requiredText = _a.requiredText, className = _a.className, children = _a.children, _b = _a.isCollapsable, isCollapsable = _b === void 0 ? true : _b;
    var _c = useState(open !== null && open !== void 0 ? open : false), isOpen = _c[0], setIsOpen = _c[1];
    var toggle = useCallback(function () {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);
    return (_jsxs("div", __assign({ className: className }, { children: [_jsxs("div", __assign({ className: styles.header }, { children: [_jsxs("div", __assign({ className: styles.title }, { children: [title, requiredText && (_jsx(Badge, __assign({ color: "danger", style: { marginLeft: '10px', marginBottom: '10px' } }, { children: requiredText })))] })), _jsxs("div", __assign({ className: styles.controls }, { children: [_jsx("div", { children: note !== null && note !== void 0 ? note : '' }), isCollapsable && (_jsx(Button, __assign({ color: "link", className: styles.expand, size: "sm", onClick: toggle }, { children: _jsx(Icon, { name: isOpen ? 'collapse' : 'expand' }) })))] }))] })), _jsx(BootstrapCollapse, __assign({ isOpen: isOpen || !isCollapsable }, { children: children }))] })));
};
export default Collapse;
