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
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Icon, InfiniteScrollTable } from 'ui';
import { QueryWrapper } from 'wrappers';
import sizeFormat from 'utils/sizeFormat';
import { Button } from 'reactstrap';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faSquare as filledSquare, } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import styles from './FileListing.module.scss';
var FileListingDir = function (_a) {
    var _b;
    var file = _a.file, _c = _a.onNavigate, onNavigate = _c === void 0 ? undefined : _c, _d = _a.location, location = _d === void 0 ? undefined : _d;
    if (location) {
        return (_jsxs(NavLink, __assign({ to: "".concat(location).concat((_b = file.name) !== null && _b !== void 0 ? _b : '', "/"), className: styles.dir }, { children: [file.name, "/"] })));
    }
    if (onNavigate) {
        return (_jsxs(Button, __assign({ color: "link", className: styles.link, onClick: function (e) {
                e.preventDefault();
                e.stopPropagation();
                onNavigate(file);
            }, "data-testid": "btn-link-".concat(file.name) }, { children: [file.name, "/"] })));
    }
    return _jsxs("span", { children: [file.name, "/"] });
};
/* eslint-disable-next-line */
export var FileListingCheckboxCell = React.memo(function (_a) {
    var selected = _a.selected;
    return (_jsxs("span", __assign({ className: "fa-layers fa-fw" }, { children: [_jsx(FontAwesomeIcon, { icon: filledSquare, color: "white" }), _jsx(FontAwesomeIcon, { icon: selected ? faCheckSquare : faSquare, color: "#9D85EF" }), _jsx(FontAwesomeIcon, { icon: faSquare, color: "#707070" })] })));
});
var FileListingName = function (_a) {
    var file = _a.file, _b = _a.onNavigate, onNavigate = _b === void 0 ? undefined : _b, _c = _a.location, location = _c === void 0 ? undefined : _c;
    if (file.type === 'file') {
        return _jsx(_Fragment, { children: file.name });
    }
    return (_jsx(FileListingDir, { file: file, onNavigate: onNavigate, location: location }));
};
export var FileListingTable = React.memo(function (_a) {
    var files = _a.files, _b = _a.prependColumns, prependColumns = _b === void 0 ? [] : _b, _c = _a.appendColumns, appendColumns = _c === void 0 ? [] : _c, getRowProps = _a.getRowProps, onInfiniteScroll = _a.onInfiniteScroll, isLoading = _a.isLoading, onNavigate = _a.onNavigate, location = _a.location, className = _a.className, selectMode = _a.selectMode, fields = _a.fields;
    var styleName = (selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) !== 'none' ? 'file-list-select' : 'file-list';
    var tableColumns = __spreadArray(__spreadArray([], prependColumns, true), [
        {
            Header: '',
            accessor: 'type',
            Cell: function (el) { return _jsx(Icon, { name: el.value === 'file' ? 'file' : 'folder' }); },
        },
        {
            Header: 'Name',
            Cell: function (el) { return (_jsx(FileListingName, { file: el.row.original, onNavigate: onNavigate, location: location })); },
        },
    ], false);
    if (fields === null || fields === void 0 ? void 0 : fields.some(function (field) { return field === 'size'; })) {
        tableColumns.push({
            Header: 'Size',
            accessor: 'size',
            Cell: function (el) { return _jsx("span", { children: sizeFormat(el.value) }); },
        });
    }
    if (fields === null || fields === void 0 ? void 0 : fields.some(function (field) { return field === 'lastModified'; })) {
        tableColumns.push({
            Header: 'Last Modified',
            accessor: 'lastModified',
            Cell: function (el) { return (_jsx("span", { children: formatDateTimeFromValue(new Date(el.value)) })); },
        });
    }
    tableColumns.push.apply(tableColumns, appendColumns);
    return (_jsx(InfiniteScrollTable, { className: "".concat(className, " ").concat(styles[styleName]), tableColumns: tableColumns, tableData: files, onInfiniteScroll: onInfiniteScroll, isLoading: isLoading, noDataText: "No files found", getRowProps: getRowProps }));
});
var FileSelectHeader = function (_a) {
    var onSelectAll = _a.onSelectAll, onUnselectAll = _a.onUnselectAll, selectedFileDict = _a.selectedFileDict;
    var _b = useState(false), checked = _b[0], setChecked = _b[1];
    var allSelected = Object.values(selectedFileDict).some(function (value) { return value === false; });
    var onClick = useCallback(function () {
        if (checked && !allSelected) {
            setChecked(false);
            onUnselectAll();
        }
        else {
            setChecked(true);
            onSelectAll();
        }
    }, [checked, setChecked, onSelectAll, onUnselectAll, allSelected]);
    return (_jsx("span", __assign({ className: styles['select-all'], onClick: onClick, "data-testid": "select-all" }, { children: _jsx(FileListingCheckboxCell, { selected: checked && !allSelected }) })));
};
var FileListing = function (_a) {
    var _b;
    var systemId = _a.systemId, path = _a.path, _c = _a.onSelect, onSelect = _c === void 0 ? undefined : _c, _d = _a.onUnselect, onUnselect = _d === void 0 ? undefined : _d, _e = _a.onNavigate, onNavigate = _e === void 0 ? undefined : _e, _f = _a.location, location = _f === void 0 ? undefined : _f, className = _a.className, _g = _a.fields, fields = _g === void 0 ? ['size', 'lastModified'] : _g, _h = _a.selectedFiles, selectedFiles = _h === void 0 ? [] : _h, selectMode = _a.selectMode;
    var _j = Hooks.useList({ systemId: systemId, path: path }), hasNextPage = _j.hasNextPage, isLoading = _j.isLoading, error = _j.error, fetchNextPage = _j.fetchNextPage, concatenatedResults = _j.concatenatedResults, isFetchingNextPage = _j.isFetchingNextPage;
    var infiniteScrollCallback = useCallback(function () {
        if (hasNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage]);
    var files = useMemo(function () { return concatenatedResults !== null && concatenatedResults !== void 0 ? concatenatedResults : []; }, [concatenatedResults]);
    var selectedFileDict = React.useMemo(function () {
        var result = {};
        var selectedDict = {};
        selectedFiles.forEach(function (file) {
            var _a;
            selectedDict[(_a = file.path) !== null && _a !== void 0 ? _a : ''] = true;
        });
        concatenatedResults === null || concatenatedResults === void 0 ? void 0 : concatenatedResults.forEach(function (file) {
            var _a, _b, _c;
            result[(_a = file.path) !== null && _a !== void 0 ? _a : ''] = (_c = selectedDict[(_b = file.path) !== null && _b !== void 0 ? _b : '']) !== null && _c !== void 0 ? _c : false;
        });
        return result;
    }, [selectedFiles, concatenatedResults]);
    var prependColumns = ((_b = selectMode === null || selectMode === void 0 ? void 0 : selectMode.types) === null || _b === void 0 ? void 0 : _b.length)
        ? [
            {
                Header: (_jsx(FileSelectHeader, { onSelectAll: function () {
                        return onSelect && onSelect(concatenatedResults !== null && concatenatedResults !== void 0 ? concatenatedResults : []);
                    }, onUnselectAll: function () {
                        return onUnselect && onUnselect(concatenatedResults !== null && concatenatedResults !== void 0 ? concatenatedResults : []);
                    }, selectedFileDict: selectedFileDict })),
                id: 'multiselect',
                Cell: function (el) {
                    var _a;
                    return (_jsx(FileListingCheckboxCell, { selected: selectedFileDict[(_a = el.row.original.path) !== null && _a !== void 0 ? _a : ''] }));
                },
            },
        ]
        : [];
    var fileSelectCallback = useCallback(function (file) {
        var _a, _b;
        if (!((_a = selectMode === null || selectMode === void 0 ? void 0 : selectMode.types) === null || _a === void 0 ? void 0 : _a.some(function (allowed) { return allowed === file.type; }))) {
            return;
        }
        if (selectedFileDict[(_b = file.path) !== null && _b !== void 0 ? _b : ''] && onUnselect) {
            onUnselect([file]);
        }
        else {
            onSelect && onSelect([file]);
        }
    }, [selectMode, onUnselect, selectedFileDict, onSelect]);
    // Maps rows to row properties, such as classNames
    var getRowProps = function (row) {
        var _a;
        var file = row.original;
        return {
            onClick: function () { return fileSelectCallback(file); },
            'data-testid': file.name,
            className: selectedFileDict[(_a = file.path) !== null && _a !== void 0 ? _a : ''] ? styles.selected : '',
        };
    };
    return (_jsx(QueryWrapper, __assign({ isLoading: isLoading, error: error, className: className }, { children: _jsx(FileListingTable, { files: files, prependColumns: prependColumns, onInfiniteScroll: infiniteScrollCallback, isLoading: isFetchingNextPage, getRowProps: getRowProps, location: location, onNavigate: onNavigate, fields: fields, selectMode: selectMode }) })));
};
export default FileListing;
