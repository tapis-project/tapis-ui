import { formatDateTime } from './timeFormat';


describe('time utility functions', () => {
  it('get formatted times', () => {
    expect(formatDateTime(new Date("2020-10-15T17:01:14.447Z"))).toEqual('10/15/2020 12:01');
  });
});
