import { formatDateTime, formatDate, formatTime } from './timeFormat';

describe('time utility functions', () => {
  it('formatDateTime output matches MM/DD/YYYY HH:MM format', () => {
    // toLocaleString output varies by system timezone, so test the shape only.
    const result = formatDateTime(new Date('2020-10-15T12:01:14.447Z'));
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it('formatDate produces MM/DD/YYYY', () => {
    expect(formatDate(new Date('2020-10-15T12:01:14.447Z'))).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/
    );
  });

  it('formatTime produces HH:MM in 24h', () => {
    // Verify no am/pm suffix and correct digit counts
    expect(formatTime(new Date('2020-10-15T12:01:14.447Z'))).toMatch(
      /^\d{2}:\d{2}$/
    );
  });
});
