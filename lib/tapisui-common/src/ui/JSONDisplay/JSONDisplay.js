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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useCallback } from 'react';
import { Input, FormGroup, Label, Button } from 'reactstrap';
import { CopyButton, TooltipModal } from 'ui';
import styles from './JSONDisplay.module.scss';
import { Icon } from 'ui';
var simplifyObject = function (obj) {
    var result = JSON.parse(JSON.stringify(obj));
    Object.entries(result).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value)) {
            if (value.length === 0) {
                delete result[key];
            }
            return;
        }
        if (typeof value === 'object') {
            var simplifiedValue = simplifyObject(value);
            if (Object.entries(simplifiedValue).length === 0) {
                delete result[key];
            }
            else {
                result[key] = simplifiedValue;
            }
            return;
        }
        if (value === undefined) {
            delete result[key];
        }
    });
    return result;
};
var convertSets = function (obj) {
    if (obj === undefined) {
        return undefined;
    }
    if (Array.isArray(obj)) {
        return obj.map(function (value) { return convertSets(value); });
    }
    if (obj instanceof Set) {
        return Array.from(obj).map(function (value) { return convertSets(value); });
    }
    if (typeof obj === 'object') {
        var result_1 = {};
        Object.entries(obj).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            result_1[key] = convertSets(value);
        });
        return result_1;
    }
    return JSON.parse(JSON.stringify(obj));
};
export var ToolbarButton = function (_a) {
    var text = _a.text, icon = _a.icon, onClick = _a.onClick, _b = _a.disabled, disabled = _b === void 0 ? true : _b, rest = __rest(_a, ["text", "icon", "onClick", "disabled"]);
    return (_jsx("div", { children: _jsxs(Button, __assign({ disabled: disabled, onClick: onClick, className: "".concat(styles['toolbar-btn'], " ").concat(styles['nav-background']) }, rest, { children: [icon && _jsx(Icon, { name: icon }), _jsxs("span", { children: [" ", text] })] })) }));
};
var JSONDisplay = function (_a) {
    var json = _a.json, className = _a.className, tooltipText = _a.tooltipText, tooltipTitle = _a.tooltipTitle, _b = _a.checkbox, checkbox = _b === void 0 ? true : _b, _c = _a.jsonstringify, jsonstringify = _c === void 0 ? true : _c;
    var _d = useState(true), simplified = _d[0], setSimplified = _d[1];
    var onChange = useCallback(function () {
        setSimplified(!simplified);
    }, [setSimplified, simplified]);
    var jsonString = useMemo(function () {
        return JSON.stringify(simplified ? simplifyObject(convertSets(json)) : convertSets(json), null, 2);
    }, [json, simplified]);
    // Sometimes we want this transform, sometimes we don't.
    var output_json = jsonstringify ? jsonString : json;
    // Determine line length of JSON to set textarea rows. As that's prettier than a second scrollbar.
    var lines = output_json.split('\n');
    var minRows = 5;
    // Use this to control how large the textarea is. There's probably a better way to do this.
    var availableSpace = Math.floor(window.innerHeight / 37); // Assuming each row is 20px tall
    var lineLengths = Math.max(minRows, Math.min(lines.length, availableSpace));
    var _e = useState(undefined), modal = _e[0], setModal = _e[1];
    var toggle = function () {
        setModal(undefined);
    };
    return (_jsxs("div", __assign({ className: className }, { children: [_jsxs("div", __assign({ className: styles.controls }, { children: [checkbox && (_jsx(FormGroup, __assign({ check: true }, { children: _jsxs(Label, __assign({ check: true, size: "sm", className: "form-field__label" }, { children: [_jsx(Input, { type: "checkbox", onChange: onChange }), "Include Empty Parameters"] })) }))), _jsx(CopyButton, { value: output_json, className: styles.copyButtonRight }), tooltipText && (_jsx(ToolbarButton, { text: "", icon: "bulb", disabled: false, onClick: function () { return setModal('tooltip'); }, "aria-label": "tooltip" })), tooltipText && modal === 'tooltip' && (_jsx(TooltipModal, { toggle: toggle, tooltipText: tooltipText, tooltipTitle: tooltipTitle }))] })), _jsx(Input, { type: "textarea", value: output_json, className: styles.json, rows: lineLengths, disabled: true })] })));
};
export default JSONDisplay;
