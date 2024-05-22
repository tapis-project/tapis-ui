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
import styles from './FieldWrapperFormik.module.css';
import { Field, useField } from 'formik';
export var FieldWrapper = function (_a) {
    var name = _a.name, label = _a.label, required = _a.required, description = _a.description, _b = _a.isHidden, isHidden = _b === void 0 ? false : _b, Component = _a.as;
    var _c = useField(name), meta = _c[1];
    return (_jsx(FormGroup, { children: _jsxs("span", __assign({ className: isHidden ? styles['hidden'] : '' }, { children: [_jsxs(Label, __assign({ className: "form-field__label", size: "sm", style: { display: 'flex', alignItems: 'center' }, htmlFor: name }, { children: [label, required && !isHidden ? (_jsx(Badge, __assign({ color: "danger", style: { marginLeft: '10px' } }, { children: "Required" }))) : null] })), _jsx(Field, { name: name, as: Component, id: name }), meta.error && (_jsx(FormText, __assign({ className: styles['form-field__help'], color: "danger" }, { children: meta.error }))), description && !meta.error && (_jsx(FormText, __assign({ className: styles['form-field__help'], color: "muted" }, { children: description })))] })) }));
};
export default FieldWrapper;
