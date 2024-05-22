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
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Icon, InfiniteScrollTable } from 'ui';
import { QueryWrapper } from 'wrappers';
import styles from './TransferListing.module.scss';
var TransferListing = function (_a) {
    var onSelect = _a.onSelect, className = _a.className;
    var _b = Hooks.Transfers.useList({}), concatenatedResults = _b.concatenatedResults, isLoading = _b.isLoading, error = _b.error, hasNextPage = _b.hasNextPage, fetchNextPage = _b.fetchNextPage;
    var infiniteScrollCallback = useCallback(function () {
        if (hasNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage]);
    var _c = useState(null), selectedTransfer = _c[0], setSelectedTransfer = _c[1];
    var selectWrapper = useCallback(function (transfer) {
        if (onSelect) {
            setSelectedTransfer(transfer);
            onSelect(transfer);
        }
    }, [setSelectedTransfer, onSelect]);
    var systems = concatenatedResults !== null && concatenatedResults !== void 0 ? concatenatedResults : [];
    var tableColumns = [
        {
            Header: '',
            id: 'icon',
            Cell: function (el) { return _jsx(Icon, { name: "globe" }); },
        },
        {
            Header: 'Transfer',
            id: 'name',
            Cell: function (el) {
                var _a, _b;
                var transfer = el.row
                    .original;
                return (_jsx("span", { children: (_b = (_a = transfer.tag) !== null && _a !== void 0 ? _a : transfer.uuid) !== null && _b !== void 0 ? _b : 'Unidentified transfer' }));
            },
        },
        {
            Header: 'Status',
            id: 'status',
            accessor: 'status',
            Cell: function (el) { return _jsx("span", { children: el.value }); },
        },
    ];
    // Maps rows to row properties, such as classNames
    var getRowProps = function (row) {
        var transfer = row.original;
        return {
            className: "".concat((selectedTransfer === null || selectedTransfer === void 0 ? void 0 : selectedTransfer.id) === transfer.id ? styles.selected : '', " ").concat(onSelect ? styles.selectable : ''),
            onClick: function () { return selectWrapper(transfer); },
            'data-testid': transfer.id,
        };
    };
    return (_jsx(QueryWrapper, __assign({ isLoading: isLoading, error: error, className: className }, { children: _jsx(InfiniteScrollTable, { className: styles['transfer-list'], tableColumns: tableColumns, tableData: systems, isLoading: isLoading, noDataText: "No transfers found", getRowProps: getRowProps, onInfiniteScroll: infiniteScrollCallback }) })));
};
export default TransferListing;
