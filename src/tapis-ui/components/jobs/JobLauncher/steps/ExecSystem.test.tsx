import '@testing-library/jest-dom/extend-expect';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { tapisApp } from 'fixtures/apps.fixtures';
import { getLogicalQueue } from './ExecSystem';

describe('ExecSystem job launcher step', () => {
  it('Finds the default logical queue for an app', async () => {
    // If the app default logical queue is available in the selected system, then use that
    expect(
      getLogicalQueue(tapisApp, [tapisSystem], 'testuser2.execution')
    ).toEqual('tapisNormal');

    // If the app default logical queue is available in the selected system even if it's a different system, use that
    const alternateSystem = JSON.parse(JSON.stringify(tapisSystem));
    alternateSystem.id = 'alternateSystem';
    expect(
      getLogicalQueue(tapisApp, [alternateSystem], 'alternateSystem')
    ).toEqual('tapisNormal');

    // If the app default logical queue is not available in the selected system, use that system's default queue
    alternateSystem.batchDefaultLogicalQueue = 'alternateQueue';
    alternateSystem.batchLogicalQueues[0].name = 'alternateQueue';
    expect(
      getLogicalQueue(tapisApp, [alternateSystem], 'alternateSystem')
    ).toEqual('alternateQueue');

    // If the app default logical queue is not available in the selected system and there is no fallback, then
    // logical queue result will be undefined
    alternateSystem.batchDefaultLogicalQueue = undefined;
    expect(
      getLogicalQueue(tapisApp, [alternateSystem], 'alternateSystem')
    ).not.toBeDefined();
  });
});
