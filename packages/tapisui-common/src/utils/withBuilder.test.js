import {expect, describe, it} from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';
import withBuilder from './withBuilder';

describe('withFragment', function () {
    it('generates a hook and a Provider', function () {
        var _a = withBuilder(), useBuilderContext = _a.useBuilderContext, Provider = _a.Provider;
        var hook = renderHook(function () { return useBuilderContext(); });
        expect(Provider).toBeDefined();
        expect(hook.result.current.data).toBeDefined();
        expect(hook.result.current.add).toBeDefined();
    });
});
