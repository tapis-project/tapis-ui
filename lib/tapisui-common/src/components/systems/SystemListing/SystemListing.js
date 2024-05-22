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
import { useState, useCallback } from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Icon, InfiniteScrollTable } from 'ui';
import { QueryWrapper } from 'wrappers';
import { Button } from 'reactstrap';
import styles from './SystemListing.module.scss';
var SystemListingItem = function (_a) {
    var system = _a.system, onNavigate = _a.onNavigate;
    if (onNavigate) {
        return (_jsx(Button, __assign({ color: "link", className: styles.link, onClick: function (e) {
                e.preventDefault();
                onNavigate(system);
            }, "data-testid": "href-".concat(system.id) }, { children: system.id })));
    }
    return _jsx("span", { children: system.id });
};
var SystemListing = function (_a) {
    var _b;
    var onSelect = _a.onSelect, onNavigate = _a.onNavigate, className = _a.className;
    var _c = Hooks.useList(), data = _c.data, isLoading = _c.isLoading, error = _c.error;
    var _d = useState(null), selectedSystem = _d[0], setSelectedSystem = _d[1];
    var selectWrapper = useCallback(function (system) {
        if (onSelect) {
            setSelectedSystem(system);
            onSelect(system);
        }
    }, [setSelectedSystem, onSelect]);
    var systems = (_b = data === null || data === void 0 ? void 0 : data.result) !== null && _b !== void 0 ? _b : [];
    var tableColumns = [
        {
            Header: '',
            id: 'icon',
            Cell: function (el) { return _jsx(Icon, { name: "data-files" }); },
        },
        {
            Header: 'System',
            id: 'name',
            Cell: function (el) { return (_jsx(SystemListingItem, { system: el.row.original, onNavigate: onNavigate })); },
        },
    ];
    // Maps rows to row properties, such as classNames
    var getRowProps = function (row) {
        var system = row.original;
        return {
            className: (selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.id) === system.id ? styles.selected : '',
            onClick: function () { return selectWrapper(system); },
            'data-testid': system.id,
        };
    };
    return (_jsx(QueryWrapper, __assign({ isLoading: isLoading, error: error, className: className }, { children: _jsx(InfiniteScrollTable, { className: styles['system-list'], tableColumns: tableColumns, tableData: systems, isLoading: isLoading, noDataText: "No systems found", getRowProps: getRowProps }) })));
};
export default SystemListing;
