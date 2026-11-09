import { copyTextToClipboard } from './copyToClipboard';

const stubClipboard = (writeText: jest.Mock | undefined) =>
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });

describe('copyTextToClipboard', () => {
  beforeEach(() => {
    document.execCommand = jest.fn(() => true);
  });

  it('writes through the clipboard API', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    await copyTextToClipboard('x');
    expect(writeText).toHaveBeenCalledWith('x');
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when the API rejects', async () => {
    stubClipboard(jest.fn().mockRejectedValue(new Error('denied')));
    await copyTextToClipboard('x');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('rejects when neither path wrote the text', async () => {
    stubClipboard(undefined);
    document.execCommand = jest.fn(() => false);
    await expect(copyTextToClipboard('x')).rejects.toThrow('Copy failed');
  });
});
