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
import { Button } from 'reactstrap';
import { GenericModal } from 'ui';
import { SubmitWrapper } from 'wrappers';
var ConfirmModal = function (_a) {
    var toggle = _a.toggle, title = _a.title, message = _a.message, onConfirm = _a.onConfirm, isLoading = _a.isLoading, isSuccess = _a.isSuccess, isError = _a.isError, error = _a.error;
    return (_jsx(GenericModal, { toggle: toggle, title: title || 'Confirm', body: message || 'Are you sure you want to continue?', footer: _jsxs(SubmitWrapper, __assign({ className: '', isLoading: isLoading, error: error, success: isSuccess ? "Success" : '', reverse: true }, { children: [_jsx(Button, __assign({ form: "newsystem-form", color: "primary", "aria-label": "Submit", type: "submit", onClick: toggle }, { children: "Cancel" })), _jsx(Button, __assign({ form: "newsystem-form", color: "primary", "aria-label": "Submit", type: "submit", onClick: onConfirm }, { children: "Confirm" }))] })) }));
};
export default ConfirmModal;
