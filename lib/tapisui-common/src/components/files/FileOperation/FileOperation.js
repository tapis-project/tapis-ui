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
import { Files } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { Form, Formik } from 'formik';
import { FormikInput, FormikSelect, FormikCheck, } from 'ui-formik/FieldWrapperFormik';
import { SubmitWrapper } from 'wrappers';
import { focusManager } from 'react-query';
import * as Yup from 'yup';
var FileOperation = function (_a) {
    var systemId = _a.systemId, path = _a.path, _b = _a.className, className = _b === void 0 ? '' : _b;
    var onSuccess = useCallback(function () {
        focusManager.setFocused(true);
    }, []);
    var _c = Hooks.useNativeOp(), nativeOp = _c.nativeOp, isLoading = _c.isLoading, error = _c.error, isSuccess = _c.isSuccess, reset = _c.reset;
    useEffect(function () {
        reset();
    }, [reset]);
    var validationSchema = Yup.object({
        recursive: Yup.boolean(),
        operation: Yup.string().required('An operation is required'),
        argument: Yup.string(),
    });
    var initialValues = {
        recursive: false,
        operation: Files.NativeLinuxOpRequestOperationEnum.Chmod,
        argument: '',
    };
    var onSubmit = useCallback(function (_a) {
        var recursive = _a.recursive, operation = _a.operation, argument = _a.argument;
        nativeOp({ systemId: systemId, path: path, recursive: recursive, operation: operation, argument: argument }, { onSuccess: onSuccess });
    }, [nativeOp, onSuccess, systemId, path]);
    return (_jsx(Formik, __assign({ initialValues: initialValues, validationSchema: validationSchema, onSubmit: onSubmit }, { children: _jsxs(Form, __assign({ className: className }, { children: [_jsxs(FormikSelect, __assign({ name: "operation", label: "Linux Operation", required: true, description: "Native operation to execute", "aria-label": "Operation" }, { children: [_jsx("option", __assign({ value: Files.NativeLinuxOpRequestOperationEnum.Chmod }, { children: "CHMOD" })), _jsx("option", __assign({ value: Files.NativeLinuxOpRequestOperationEnum.Chown }, { children: "CHOWN" })), _jsx("option", __assign({ value: Files.NativeLinuxOpRequestOperationEnum.Chgrp }, { children: "CHGRP" }))] })), _jsx(FormikInput, { name: "argument", label: "Arguments", required: false, description: "Arguments for the native file operation", "aria-label": "Arguments" }), _jsx(FormikCheck, { name: "recursive", label: "Recursive", required: false, description: "Run operation recursively", "aria-label": "Recursive" }), _jsx(SubmitWrapper, __assign({ isLoading: isLoading, error: error, success: isSuccess ? "Successfully submitted operation" : '' }, { children: _jsx(Button, __assign({ color: "primary", disabled: isLoading || isSuccess, "aria-label": "Submit", type: "submit" }, { children: "Run Operation" })) }))] })) })));
};
export default FileOperation;
