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
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
var GenericModal = function (_a) {
    var toggle = _a.toggle, title = _a.title, body = _a.body, footer = _a.footer, props = __rest(_a, ["toggle", "title", "body", "footer"]);
    return (_jsxs(Modal, __assign({ backdrop: "static", keyboard: true, isOpen: true, toggle: toggle }, props, { children: [_jsx(ModalHeader, __assign({ toggle: toggle, charCode: "\u2715" }, { children: _jsx("span", { children: title }) })), _jsx(ModalBody, { children: body }), footer && _jsx(ModalFooter, { children: footer })] })));
};
export default GenericModal;
