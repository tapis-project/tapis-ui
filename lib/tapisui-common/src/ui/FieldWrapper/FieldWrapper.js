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
import { FormGroup, Label, FormText, Badge } from 'reactstrap';
import './FieldWrapper.scss';
var FieldWrapper = function (_a) {
    var label = _a.label, required = _a.required, description = _a.description, children = _a.children, error = _a.error;
    return (_jsxs(FormGroup, { children: [_jsxs(Label, __assign({ className: "form-field__label", size: "sm", style: { display: 'flex', alignItems: 'center' } }, { children: [label, ' ', required ? (_jsx(Badge, __assign({ color: "danger", style: { marginLeft: '10px' } }, { children: "Required" }))) : null] })), children, error ? (_jsx("div", __assign({ className: "form-field__validation-error" }, { children: error }))) : (description && (_jsx(FormText, __assign({ className: "form-field__help", color: "muted" }, { children: description }))))] }));
};
export default FieldWrapper;
