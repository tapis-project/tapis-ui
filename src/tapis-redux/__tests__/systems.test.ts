import { list } from 'tapis-redux/systems/actions';
import { Systems } from '@tapis/tapis-typescript';
import { Config, ApiCallback } from 'tapis-redux/types';

describe('Systems dispatch generators', () => {
  it('generates a system listing dispatch', async () => {
    const callback: ApiCallback<Systems.RespSystems> = (result: Systems.RespSystems) => {};
    const providedConfig: Config = {
      authenticator: 'mock.authenticator',
      tenant: 'mock.tenant',
      token: {
        access_token: 'mock_token',
        expires_at: 'tomorrow',
        expires_in: 24
      }
    }
    const call = list(providedConfig, callback);
    const {
      config,
      onApi,
      dispatches,
      module,
      api,
      fnName,
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
    expect(fnName).toEqual('getSystems');
    expect(args).toEqual([{}]);
  });
});