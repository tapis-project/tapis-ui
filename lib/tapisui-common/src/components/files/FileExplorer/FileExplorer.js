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
import { useCallback, useState, useEffect } from 'react';
import { breadcrumbsFromPathname, Breadcrumbs } from 'ui';
import { FileListing } from '../../files/FileListing';
import { SystemListing } from '../../systems';
import { normalize } from 'path';
import styles from './FileExplorer.module.scss';
var FileExplorer = function (_a) {
    var systemId = _a.systemId, path = _a.path, className = _a.className, allowSystemChange = _a.allowSystemChange, onNavigate = _a.onNavigate, onSelect = _a.onSelect, onUnselect = _a.onUnselect, _b = _a.fields, fields = _b === void 0 ? ['size'] : _b, selectedFiles = _a.selectedFiles, selectMode = _a.selectMode;
    var _c = useState(systemId), currentSystem = _c[0], setCurrentSystem = _c[1];
    var _d = useState(path), currentPath = _d[0], setCurrentPath = _d[1];
    var _e = useState([]), targetBreadcrumbs = _e[0], setTargetBreadcrumbs = _e[1];
    var onFileNavigate = useCallback(function (file) {
        var newPath = normalize("".concat(currentPath, "/").concat(file.name));
        setCurrentPath(newPath);
        onNavigate && onNavigate(currentSystem !== null && currentSystem !== void 0 ? currentSystem : null, newPath);
    }, [setCurrentPath, currentPath, onNavigate, currentSystem]);
    var onSystemNavigate = useCallback(function (system) {
        var _a;
        if (!system) {
            onNavigate && onNavigate(null, null);
        }
        setCurrentSystem(system === null || system === void 0 ? void 0 : system.id);
        setCurrentPath('/');
        onNavigate && onNavigate((_a = system === null || system === void 0 ? void 0 : system.id) !== null && _a !== void 0 ? _a : null, '/');
    }, [setCurrentPath, setCurrentSystem, onNavigate]);
    var onBreadcrumbNavigate = useCallback(function (to) {
        setCurrentPath(to);
        onNavigate && onNavigate(currentSystem !== null && currentSystem !== void 0 ? currentSystem : null, to);
    }, [setCurrentPath, currentSystem, onNavigate]);
    useEffect(function () {
        var breadcrumbs = breadcrumbsFromPathname(currentPath !== null && currentPath !== void 0 ? currentPath : '');
        var newCrumbs = breadcrumbs.map(function (breadcrumb) { return (__assign(__assign({}, breadcrumb), { onClick: onBreadcrumbNavigate })); });
        newCrumbs.unshift({
            text: currentSystem !== null && currentSystem !== void 0 ? currentSystem : '',
            to: '/',
            onClick: onBreadcrumbNavigate,
        });
        setTargetBreadcrumbs(newCrumbs);
    }, [
        setTargetBreadcrumbs,
        currentPath,
        setCurrentPath,
        currentSystem,
        onBreadcrumbNavigate,
    ]);
    var breadcrumbs = [];
    if (allowSystemChange) {
        breadcrumbs.push({
            text: 'Files',
            to: '/',
            onClick: function () { return onSystemNavigate(null); },
        });
    }
    if (currentSystem) {
        breadcrumbs.push.apply(breadcrumbs, targetBreadcrumbs);
    }
    return (_jsxs("div", __assign({ className: className }, { children: [_jsx(Breadcrumbs, { breadcrumbs: breadcrumbs }), _jsx("div", { children: currentSystem ? (_jsx(FileListing, { className: "".concat(styles['nav-list']), systemId: currentSystem, path: currentPath !== null && currentPath !== void 0 ? currentPath : '/', onNavigate: onFileNavigate, onSelect: onSelect, onUnselect: onUnselect, selectedFiles: selectedFiles, fields: fields, selectMode: selectMode })) : (_jsx(SystemListing, { className: "".concat(styles['nav-list']), onNavigate: onSystemNavigate })) })] })));
};
export default FileExplorer;
