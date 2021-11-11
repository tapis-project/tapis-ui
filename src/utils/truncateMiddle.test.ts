import truncateMiddle from './truncateMiddle';


describe('truncateMiddle', () => {
  it('returns middle-truncated string', () => {
    const longString = 'thisIsSomeTestJobName-10-12-2020 01:01:01Z';
    const maxLen = 20;
    expect(truncateMiddle(longString, maxLen)).toEqual('thisIsSom...1:01:01Z');
  });

  it('throws an error if `maxLen < 5`', () => {
    const shortString = 'test';
    const maxLen = 4;
    expect(() => truncateMiddle(shortString, maxLen)).toThrow();
  });

  it('returns original string if `5 <= string.length > maxLen`', () => {
    const s = 'testString';
    const maxLen = 20;
    expect(truncateMiddle(s, maxLen)).toEqual('testString');
  });
});
