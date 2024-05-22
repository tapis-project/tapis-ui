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
import { Route, Redirect } from 'react-router-dom';
// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function ProtectedRoute(_a) {
    var accessToken = _a.accessToken, children = _a.children, rest = __rest(_a, ["accessToken", "children"]);
    return (_jsx(Route, __assign({}, rest, { render: function (_a) {
            var location = _a.location;
            return accessToken ? (children) : (_jsx(Redirect, { to: {
                    pathname: '/login',
                    state: { from: location },
                } }));
        } })));
}
export default ProtectedRoute;
