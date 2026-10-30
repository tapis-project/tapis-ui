import { describe, expect, it } from 'vitest';
import {
  FILE_EXTENSION_ICON_MAP,
  getFileIconDefinition,
} from './icon-resolver';

describe('File Explorer V2 icon resolver', () => {
  it.each([
    ['jpg', 'mui'],
    ['docx', 'react-icons'],
    ['xlsx', 'react-icons'],
    ['pptx', 'react-icons'],
    ['js', 'react-icons'],
    ['ts', 'react-icons'],
    ['py', 'react-icons'],
    ['ipynb', 'react-icons'],
    ['rs', 'react-icons'],
    ['vue', 'react-icons'],
    ['zip', 'mui'],
    ['mp4', 'mui'],
    ['parquet', 'mui'],
    ['vtk', 'mui'],
  ] as const)('maps .%s files to a %s icon', (extension, source) => {
    expect(getFileIconDefinition(extension).source).toBe(source);
  });

  it('normalizes capitalization and a leading period', () => {
    expect(getFileIconDefinition('.PDF')).toBe(FILE_EXTENSION_ICON_MAP.pdf);
  });

  it('falls back to MIME type when the extension is unavailable', () => {
    expect(getFileIconDefinition(undefined, 'image/png')).toBe(
      FILE_EXTENSION_ICON_MAP.png
    );
  });

  it('uses the generic icon for an unknown extension and MIME type', () => {
    const unknown = getFileIconDefinition('unknown-extension');

    expect(unknown.source).toBe('mui');
    expect(unknown).not.toBe(FILE_EXTENSION_ICON_MAP.png);
  });
});
