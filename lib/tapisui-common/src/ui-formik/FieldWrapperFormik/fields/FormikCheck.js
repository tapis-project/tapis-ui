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
import { Field } from 'formik';
import { Input, FormText, FormGroup, Label } from 'reactstrap';
import styles from './FormikCheck.module.scss';
var FormikCheck = function (_a) {
    var name = _a.name, label = _a.label, required = _a.required, description = _a.description, props = __rest(_a, ["name", "label", "required", "description"]);
    return (_jsxs(FormGroup, __assign({ check: true }, { children: [_jsxs(Label, __assign({ check: true, className: "form-field__label ".concat(styles.nospace), size: "sm" }, { children: [_jsx(Field, { name: name, as: function (formikProps) {
                            var _a;
                            return (_jsx(Input, __assign({ bsSize: (_a = props['bsSize']) !== null && _a !== void 0 ? _a : 'sm', type: "checkbox" }, props, formikProps, { checked: formikProps.value })));
                        } }), label] })), _jsx(FormText, __assign({ className: "form-field__help ".concat(styles.nospace), color: "muted" }, { children: description }))] })));
};
export default FormikCheck;
