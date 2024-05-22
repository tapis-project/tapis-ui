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
import { useCallback, useState, useMemo } from 'react';
import { GenericModal } from 'ui';
import { FileExplorer } from 'components/files';
import { Button } from 'reactstrap';
var FileSelectModal = function (_a) {
    var _b, _c;
    var systemId = _a.systemId, path = _a.path, allowSystemChange = _a.allowSystemChange, onSelect = _a.onSelect, toggle = _a.toggle, _d = _a.selectMode, selectMode = _d === void 0 ? { mode: 'single', types: ['file', 'dir'] } : _d, initialSelection = _a.initialSelection;
    var _e = useState(initialSelection !== null && initialSelection !== void 0 ? initialSelection : []), selectedFiles = _e[0], setSelectedFiles = _e[1];
    var _f = useState(systemId !== null && systemId !== void 0 ? systemId : null), selectedSystem = _f[0], setSelectedSystem = _f[1];
    var _g = useState(path !== null && path !== void 0 ? path : '/'), currentPath = _g[0], setCurrentPath = _g[1];
    // Is the FileSelectModal set up to allow single directory selection?
    var dirSelectMode = useMemo(function () {
        var _a, _b;
        return ((selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) === 'single' &&
            ((_a = selectMode === null || selectMode === void 0 ? void 0 : selectMode.types) === null || _a === void 0 ? void 0 : _a.length) === 1 &&
            ((_b = selectMode === null || selectMode === void 0 ? void 0 : selectMode.types) === null || _b === void 0 ? void 0 : _b.some(function (mode) { return mode === 'dir'; })));
    }, [selectMode]);
    var fileExplorerSelectCallback = useCallback(function (files) {
        if ((selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) === 'multi') {
            setSelectedFiles(__spreadArray(__spreadArray([], selectedFiles, true), files, true));
        }
        else {
            setSelectedFiles(files);
        }
    }, [setSelectedFiles, selectedFiles, selectMode]);
    var fileExplorerUnselectCallback = useCallback(function (files) {
        if ((selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) === 'multi') {
            setSelectedFiles(selectedFiles.filter(function (selected) {
                return !files.some(function (unselected) { return unselected.path === selected.path; });
            }));
        }
        else {
            setSelectedFiles([]);
        }
    }, [setSelectedFiles, selectedFiles, selectMode]);
    var fileExplorerNavigateCallback = useCallback(function (systemId, path) {
        setSelectedSystem(systemId);
        setSelectedFiles([]);
        setCurrentPath(path !== null && path !== void 0 ? path : '/');
    }, [setSelectedSystem, setSelectedFiles, setCurrentPath]);
    var selectButtonCallback = useCallback(function () {
        if (toggle) {
            toggle();
        }
        if (onSelect) {
            if (!!selectedFiles.length) {
                onSelect(selectedSystem, selectedFiles);
            }
            else if (dirSelectMode) {
                onSelect(selectedSystem, [
                    { name: currentPath.split('/').slice(-1)[0], path: currentPath },
                ]);
            }
        }
    }, [
        toggle,
        onSelect,
        selectedSystem,
        selectedFiles,
        currentPath,
        dirSelectMode,
    ]);
    var body = (_jsx(FileExplorer, { allowSystemChange: allowSystemChange, systemId: systemId, path: currentPath, selectMode: selectMode, onSelect: fileExplorerSelectCallback, onUnselect: fileExplorerUnselectCallback, onNavigate: fileExplorerNavigateCallback, fields: ['size', 'lastModified'], selectedFiles: selectedFiles }));
    var footer = (_jsxs(Button, __assign({ disabled: selectedFiles.length === 0 && !dirSelectMode, color: "primary", onClick: selectButtonCallback, "data-testid": "modalSelect" }, { children: ["Select", ' ', "".concat((selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) === 'multi'
                ? "(".concat(selectedFiles.length, ")")
                : dirSelectMode
                    ? "".concat(!!selectedFiles.length ? selectedFiles[0].name : currentPath)
                    : "".concat(!!selectedFiles.length ? selectedFiles[0].name : ''))] })));
    var title = 'Select files';
    var selectionNames = (_c = (_b = selectMode === null || selectMode === void 0 ? void 0 : selectMode.types) === null || _b === void 0 ? void 0 : _b.map(function (selectType) {
        if (selectMode.mode === 'single') {
            if (selectType === 'dir') {
                return 'directory';
            }
            return 'file';
        }
        if (selectMode.mode === 'multi') {
            if (selectType === 'dir') {
                return 'directories';
            }
            return 'files';
        }
        return 'files';
    })) !== null && _c !== void 0 ? _c : [];
    if (!!selectionNames.length) {
        title = "Select ".concat((selectMode === null || selectMode === void 0 ? void 0 : selectMode.mode) === 'multi' ? 'one or more' : 'a', " ").concat(selectionNames[0], " ").concat(selectionNames.length > 1 ? " or ".concat(selectionNames[1]) : '');
    }
    return (_jsx(GenericModal, { toggle: toggle, title: title, size: "lg", body: body, footer: footer }));
};
export default FileSelectModal;
