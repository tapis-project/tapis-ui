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
import React, { useReducer, useContext, useEffect } from 'react';
/**
 * Creates a Provider and context hook for a given data type
 * that builds a structure from slices of the provided data type
 *
 * @returns A Provider and a context hook
 */
var withBuilder = function () {
    var context = React.createContext({
        data: {},
        add: function (slice) { },
        set: function (slice) { },
        clear: function () { },
    });
    var useBuilderContext = function () { return useContext(context); };
    var Provider = function (_a) {
        var children = _a.children, value = _a.value;
        var reducer = function (state, payload) {
            var action = payload.action, slice = payload.slice;
            switch (action) {
                case 'add':
                    return __assign(__assign({}, state), slice);
                case 'set':
                    return __assign({}, slice);
                case 'clear':
                    return {};
                default:
                    return __assign({}, state);
            }
        };
        var _b = useReducer(reducer, __assign({}, value)), data = _b[0], dispatch = _b[1];
        useEffect(function () {
            dispatch({ action: 'set', slice: value });
        }, [dispatch, value]);
        var contextValue = {
            data: data,
            add: function (slice) { return dispatch({ action: 'add', slice: slice }); },
            set: function (slice) { return dispatch({ action: 'set', slice: slice }); },
            clear: function () { return dispatch({ action: 'clear' }); },
        };
        return _jsx(context.Provider, __assign({ value: contextValue }, { children: children }));
    };
    return {
        useBuilderContext: useBuilderContext,
        Provider: Provider,
    };
};
export default withBuilder;
