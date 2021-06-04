import { list } from 'tapis-redux/systems/actions';
import { Systems } from '@tapis/tapis-typescript';
import { Config, ApiCallback } from 'tapis-redux/types';

describe('Systems dispatch generators', () => {
  it('generates a system listing dispatch', async () => {
    const callback: ApiCallback<Systems.RespSystems> = (result: Systems.RespSystems) => {};
    const providedConfig: Config = {
      tenant: 'mock.tenant',
      jwt: 'mock_jwt'
    }
    const call = list(providedConfig, callback);
    const {
      config,
      onApi,
      dispatches,
      module,
      api,
      func,
      args
    } = call.payload;
    expect(config).toStrictEqual(providedConfig);
    expect(onApi).toStrictEqual(callback);
    expect(dispatches).toStrictEqual({
      request: 'TAPIS_SYSTEMS_LIST_REQUEST',
      failure: 'TAPIS_SYSTEMS_LIST_FAILURE',
      success: 'TAPIS_SYSTEMS_LIST_SUCCESS'
    });
    expect(module).toEqual(Systems);
    expect(api).toEqual(Systems.SystemsApi);
    expect(func).toEqual(Systems.SystemsApi.prototype.getSystems);
    expect(args).toEqual([{}]);
  });
});