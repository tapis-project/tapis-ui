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
import { useState } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import styles from './Tabs.module.scss';
var Tabs = function (_a) {
    var _b;
    var tabs = _a.tabs, _c = _a.className, className = _c === void 0 ? '' : _c;
    var tabNames = Object.keys(tabs);
    var _d = useState((_b = tabNames[0]) !== null && _b !== void 0 ? _b : ''), activeTab = _d[0], setActiveTab = _d[1];
    var getTabClassname = function (tabName) {
        return "".concat(styles.tab, " ").concat(activeTab === tabName ? styles.active : '');
    };
    return (_jsxs("div", __assign({ className: className }, { children: [_jsx(Nav, __assign({ tabs: true }, { children: tabNames.map(function (tabName) { return (_jsx(NavItem, __assign({ className: getTabClassname(tabName) }, { children: _jsx(NavLink, __assign({ onClick: function () { return setActiveTab(tabName); }, "data-testid": "tab-".concat(tabName) }, { children: tabName })) }), "tab-".concat(tabName))); }) })), _jsx(TabContent, __assign({ activeTab: activeTab }, { children: tabNames.map(function (tabName) { return (_jsx(TabPane, __assign({ tabId: tabName, className: styles.pane }, { children: tabs[tabName] }), "tabcontent-".concat(tabName))); }) }))] })));
};
export default Tabs;
