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
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { SubmitWrapper, QueryWrapper } from 'wrappers';
import { focusManager } from 'react-query';
var FileOperation = function (_a) {
    var transferTaskId = _a.transferTaskId, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = Hooks.Transfers.useDetails(transferTaskId), data = _c.data, detailsIsLoading = _c.isLoading, detailsError = _c.error;
    var transfer = data === null || data === void 0 ? void 0 : data.result;
    var cancelableStatuses = [
        Files.TransferTaskStatusEnum.Accepted,
        Files.TransferTaskStatusEnum.InProgress,
        Files.TransferTaskStatusEnum.Paused,
        Files.TransferTaskStatusEnum.Staged,
        Files.TransferTaskStatusEnum.Staging,
    ];
    var cancelable = cancelableStatuses.some(function (status) { return status === (transfer === null || transfer === void 0 ? void 0 : transfer.status); });
    var _d = Hooks.Transfers.useCancel(), cancel = _d.cancel, isLoading = _d.isLoading, error = _d.error, isSuccess = _d.isSuccess, reset = _d.reset;
    var onClick = useCallback(function () {
        cancel(transferTaskId);
        focusManager.setFocused(true);
    }, [cancel, transferTaskId]);
    useEffect(function () {
        reset();
    }, [reset]);
    return (_jsxs(QueryWrapper, __assign({ isLoading: detailsIsLoading, error: detailsError, className: className }, { children: [_jsxs("div", { children: ["Transfer task ", transferTaskId, " is ", transfer === null || transfer === void 0 ? void 0 : transfer.status] }), _jsx(SubmitWrapper, __assign({ isLoading: isLoading, error: error, success: isSuccess ? "Successfully canceled transfer" : '', reverse: true }, { children: _jsx(Button, __assign({ color: "warning", disabled: !cancelable || isLoading || isSuccess, "aria-label": "Cancel", type: "submit", onClick: onClick }, { children: "Cancel Transfer" })) }))] })));
};
export default FileOperation;
