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
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { TapisProvider } from '@tapis/tapisui-hooks';
export default function renderComponent(component, history) {
    if (history === void 0) { history = null; }
    if (history) {
        return render(_jsx(TapisProvider, __assign({ basePath: "tapis.test" }, { children: _jsx(Router, __assign({ history: history }, { children: component })) })));
    }
    return render(_jsx(TapisProvider, __assign({ basePath: "tapis.test" }, { children: _jsx(BrowserRouter, { children: component }) })));
}
