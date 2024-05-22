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
import { useCallback, useEffect } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Button } from 'reactstrap';
import { SubmitWrapper } from 'wrappers';
import { focusManager } from 'react-query';
import { Form, Formik } from 'formik';
import { FormikInput } from 'ui-formik/FieldWrapperFormik';
import * as Yup from 'yup';
var TransferCreate = function (_a) {
    var _b, _c, _d, _e;
    var files = _a.files, sourceSystemId = _a.sourceSystemId, destinationSystemId = _a.destinationSystemId, destinationPath = _a.destinationPath, _f = _a.className, className = _f === void 0 ? '' : _f;
    var _g = Hooks.Transfers.useCreate(), create = _g.create, data = _g.data, isLoading = _g.isLoading, error = _g.error, isSuccess = _g.isSuccess, reset = _g.reset;
    var onSubmit = useCallback(function (_a) {
        var tag = _a.tag;
        var destinationURI = "tapis://".concat(destinationSystemId).concat(destinationPath);
        var elements = files.map(function (file) { return ({
            destinationURI: destinationURI,
            sourceURI: "tapis://".concat(sourceSystemId).concat(file.path),
        }); });
        var tagName = tag.length > 0 ? tag : undefined;
        create({ elements: elements, tag: tagName }, { onSuccess: function () { return focusManager.setFocused(true); } });
    }, [sourceSystemId, destinationSystemId, destinationPath, files, create]);
    useEffect(function () {
        reset();
    }, [reset]);
    var validationSchema = Yup.object({
        tag: Yup.string().required('a tag for this transfer is required'),
    });
    var initialValues = {
        tag: '',
    };
    return (_jsx(Formik, __assign({ initialValues: initialValues, validationSchema: validationSchema, onSubmit: onSubmit }, { children: _jsxs(Form, { children: [_jsx(FormikInput, { name: "tag", label: "Tag", required: false, description: "A tag name for this file transfer" }), _jsx(SubmitWrapper, __assign({ isLoading: isLoading, error: error, success: isSuccess
                        ? "Successfully submitted transfer ".concat((_e = (_c = (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.tag) !== null && _c !== void 0 ? _c : (_d = data === null || data === void 0 ? void 0 : data.result) === null || _d === void 0 ? void 0 : _d.uuid) !== null && _e !== void 0 ? _e : '')
                        : '', reverse: true }, { children: _jsx(Button, __assign({ color: "primary", disabled: isLoading || isSuccess, "aria-label": "Submit", type: "submit" }, { children: "Submit" })) }))] }) })));
};
export default TransferCreate;
