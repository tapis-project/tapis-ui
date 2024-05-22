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
import { jsx as _jsx } from "react/jsx-runtime";
import { GenericModal } from 'ui';
import styles from './TooltipModal.module.scss';
var TooltipModal = function (_a) {
    var toggle = _a.toggle, tooltipText = _a.tooltipText, _b = _a.tooltipTitle, tooltipTitle = _b === void 0 ? 'default tooltip title' : _b;
    return (_jsx(GenericModal, { toggle: toggle, title: tooltipTitle, backdrop: true, size: "sm", body: _jsx("div", __assign({ className: "".concat(styles['modal-settings'], " ").concat(styles['pre-wrap']) }, { children: tooltipText })) }));
};
export default TooltipModal;
