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
import { QueryWrapper } from 'wrappers';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { DescriptionList } from 'ui';
var FileStat = function (_a) {
    var systemId = _a.systemId, path = _a.path, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = Hooks.useStat({ systemId: systemId, path: path }), data = _c.data, isLoading = _c.isLoading, error = _c.error;
    var stat = data === null || data === void 0 ? void 0 : data.result;
    return (_jsxs(QueryWrapper, __assign({ isLoading: isLoading, error: error, className: className }, { children: [_jsx("h3", { children: systemId }), _jsx("h5", { children: path }), stat && _jsx(DescriptionList, { data: stat })] })));
};
export default FileStat;
