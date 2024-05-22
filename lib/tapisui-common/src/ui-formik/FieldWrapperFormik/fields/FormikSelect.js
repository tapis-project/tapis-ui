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
import { jsx as _jsx } from "react/jsx-runtime";
import FieldWrapper from '../FieldWrapperFormik';
import { Input } from 'reactstrap';
import { useFormikContext } from 'formik';
import { setFieldValue } from './formikPatch';
var FormikSelect = function (_a) {
    var name = _a.name, label = _a.label, required = _a.required, description = _a.description, children = _a.children, props = __rest(_a, ["name", "label", "required", "description", "children"]);
    var formikContext = useFormikContext();
    return (_jsx(FieldWrapper, { name: name, label: label, required: required, description: description, as: function (formikProps) {
            var formikOnChange = formikProps.onChange, otherFormikProps = __rest(formikProps, ["onChange"]);
            var onChange = function (event) {
                // Use patched formik setFieldValue
                // An option with no children and value set to undefined will preduce an empty string as the target value
                // ex: <option value={undefined} label="Please select a value" />
                setFieldValue(formikContext, name, event.target.value === '' ? undefined : event.target.value);
            };
            return (_jsx(Input, __assign({ bsSize: "sm", type: "select", onChange: onChange }, props, otherFormikProps, { children: children })));
        } }));
};
export default FormikSelect;
