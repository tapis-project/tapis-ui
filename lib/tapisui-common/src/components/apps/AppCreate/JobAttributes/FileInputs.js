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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from 'ui';
import { FieldArray, useFormikContext } from 'formik';
import { FormikInput, FormikCheck, FormikTapisFile, FormikSelect, } from 'ui-formik/FieldWrapperFormik';
import { FileInputModeEnum } from '@tapis/tapis-typescript-apps';
var JobInputField = function (_a) {
    var item = _a.item, index = _a.index, remove = _a.remove;
    var name = item.name, sourceUrl = item.sourceUrl;
    var isRequired = false;
    var note = 'User Defined';
    var fileInputModeValues = Object.values(FileInputModeEnum);
    return (_jsx(_Fragment, { children: _jsxs(Collapse, __assign({ open: !sourceUrl, title: name !== null && name !== void 0 ? name : 'File Input', note: note, className: fieldArrayStyles.item }, { children: [_jsx(FormikInput, { name: "jobAttributes.fileInputs.".concat(index, ".name"), label: "Name", required: true, description: "".concat(isRequired
                        ? 'This input is required and cannot be renamed'
                        : 'Name of this input'), disabled: isRequired }), _jsx(FormikTapisFile, { name: "jobAttributes.fileInputs.".concat(index, ".sourceUrl"), label: "Source URL", required: false, description: "Input TAPIS file as a pathname, TAPIS URI or web URL" }), _jsx(FormikInput, { name: "jobAttributes.fileInputs.".concat(index, ".targetPath"), label: "Target Path", required: true, description: "File mount path inside of running container" }), _jsx(FormikInput, { name: "jobAttributes.fileInputs.".concat(index, ".description"), label: "Description", required: false, description: "Description of this input" }), _jsxs(FormikSelect, __assign({ name: "jobAttributes.fileInputs.".concat(index, ".inputMode"), description: "The input mode for the file", label: "File Input Mode", required: false, "data-testid": "file Input Type" }, { children: [_jsx("option", __assign({ value: '', selected: true }, { children: "-- select input value type --" })), fileInputModeValues.map(function (values) {
                            return _jsx("option", { children: values });
                        })] })), _jsx(FormikCheck, { name: "jobAttributes.fileInputs.".concat(index, ".autoMountLocal"), label: "Auto-mount Local", required: false, description: "If this is true, the source URL will be mounted from the execution system's local file system" }), !isRequired && (_jsx(Button, __assign({ onClick: function () { return remove(index); }, size: "sm" }, { children: "Remove" })))] })) }));
};
var JobInputs = function (_a) {
    var _b;
    var arrayHelpers = _a.arrayHelpers;
    var values = useFormikContext().values;
    var requiredText = '';
    var jobInputs = (_b = values === null || values === void 0 ? void 0 : values.fileInputs) !== null && _b !== void 0 ? _b : [];
    return (_jsxs(Collapse, __assign({ open: false, title: "File Inputs", note: "".concat(jobInputs.length, " items"), requiredText: requiredText, isCollapsable: true, className: fieldArrayStyles.array }, { children: [_jsx("div", __assign({ className: fieldArrayStyles.description }, { children: "These File Inputs will be submitted with your job." })), jobInputs.map(function (jobInput, index) { return (_jsx(JobInputField, { item: jobInput, index: index, remove: arrayHelpers.remove }, "fileInputs.".concat(index))); }), _jsx(Button, __assign({ onClick: function () { return arrayHelpers.push({}); }, size: "sm" }, { children: "+ Add File Input" }))] })));
};
export var FileInputs = function () {
    return (_jsx("div", { children: _jsx(FieldArray, { name: "fileInputs", render: function (arrayHelpers) {
                return (_jsx(_Fragment, { children: _jsx(JobInputs, { arrayHelpers: arrayHelpers }) }));
            } }) }));
};
export default FileInputs;
