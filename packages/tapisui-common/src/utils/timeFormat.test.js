import { formatDateTime } from './timeFormat';
import {expect, describe, it} from '@jest/globals';

describe('time utility functions', function () {
    it('get formatted times', function () {
        expect(formatDateTime(new Date('2020-10-15T12:01:14.447Z'))).toEqual('10/15/2020 12:01');
    });
});
