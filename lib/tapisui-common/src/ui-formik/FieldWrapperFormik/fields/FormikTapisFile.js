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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useMemo } from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { useField } from 'formik';
import { FileSelectModal } from 'components/files';
import { useModal } from 'ui';
var pathToFile = function (path) {
    if (path) {
        return {
            name: path.split('/').slice(-1)[0],
            path: path,
        };
    }
    return undefined;
};
var pathParent = function (path) {
    var parentDir = path === null || path === void 0 ? void 0 : path.split('/').slice(0, -1).join('/');
    return !!parentDir && !!parentDir.length ? parentDir : '/';
};
export var parseTapisURI = function (uri) {
    var regex = /tapis:\/\/([\w.\-_]+)\/(.+)/;
    var match = uri === null || uri === void 0 ? void 0 : uri.match(regex);
    if (match) {
        var systemId = match[1];
        var filePath = "/".concat(match[2]);
        return {
            systemId: systemId,
            file: pathToFile(filePath),
            parent: pathParent(filePath),
        };
    }
    return undefined;
};
export var FormikTapisFileInput = function (_a) {
    var append = _a.append, _b = _a.allowSystemChange, allowSystemChange = _b === void 0 ? true : _b, disabled = _a.disabled, systemId = _a.systemId, path = _a.path, _c = _a.mode, mode = _c === void 0 ? 'single' : _c, _d = _a.files, files = _d === void 0 ? true : _d, _e = _a.dirs, dirs = _e === void 0 ? true : _e, props = __rest(_a, ["append", "allowSystemChange", "disabled", "systemId", "path", "mode", "files", "dirs"]);
    var name = props.name;
    var _f = useField(name), field = _f[0], helpers = _f[2];
    var setValue = helpers.setValue;
    var value = field.value;
    var _g = useModal(), modal = _g.modal, open = _g.open, close = _g.close;
    var onSelect = useCallback(function (systemId, files) {
        if (allowSystemChange) {
            setValue("tapis://".concat(systemId !== null && systemId !== void 0 ? systemId : '').concat(files[0].path));
        }
        else {
            setValue("".concat(files[0].path));
        }
    }, [setValue, allowSystemChange]);
    var _h = useMemo(function () {
        var _a;
        var result = (_a = parseTapisURI(value)) !== null && _a !== void 0 ? _a : {
            systemId: systemId,
            file: value ? pathToFile(value) : pathToFile(path),
            parent: value ? pathParent(value) : pathParent(path),
        };
        return result;
    }, [value, systemId, path]), parsedSystemId = _h.systemId, file = _h.file, parent = _h.parent;
    var selectMode = useMemo(function () {
        var types = [];
        if (files) {
            types.push('file');
        }
        if (dirs) {
            types.push('dir');
        }
        return {
            mode: mode,
            types: types,
        };
    }, [mode, files, dirs]);
    return (_jsxs(_Fragment, { children: [_jsxs(InputGroup, { children: [_jsx(InputGroupAddon, __assign({ addonType: "prepend" }, { children: _jsx(Button, __assign({ size: "sm", onClick: open, disabled: disabled }, { children: "Browse" })) })), _jsx(Input, __assign({ disabled: disabled }, props, { bsSize: "sm" })), !!append && (_jsx(InputGroupAddon, __assign({ addonType: "append" }, { children: append })))] }), modal && (_jsx(FileSelectModal, { toggle: close, onSelect: onSelect, systemId: parsedSystemId !== null && parsedSystemId !== void 0 ? parsedSystemId : systemId, selectMode: selectMode, path: parent, initialSelection: file ? [file] : undefined, allowSystemChange: true }))] }));
};
var FormikTapisFile = function (_a) {
    var name = _a.name, label = _a.label, required = _a.required, description = _a.description, systemId = _a.systemId, path = _a.path, mode = _a.mode, files = _a.files, dirs = _a.dirs, props = __rest(_a, ["name", "label", "required", "description", "systemId", "path", "mode", "files", "dirs"]);
    return (_jsx(FieldWrapper, { name: name, label: label, required: required, description: description, as: function (formikProps) { return (_jsx(FormikTapisFileInput, __assign({}, props, formikProps, { bsSize: "sm", systemId: systemId, path: path, mode: mode, files: files, dirs: dirs }))); } }));
};
export default React.memo(FormikTapisFile);
