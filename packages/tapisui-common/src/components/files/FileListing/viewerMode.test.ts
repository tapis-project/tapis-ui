import { describe, expect, it } from 'vitest';
import { Files } from '@tapis/tapis-typescript';
import { isSandboxed, viewerMode } from './FileViewerPanel';

const file = (name: string): Files.FileInfo =>
  ({ name, path: `/home/me/${name}`, type: 'file', size: 100 } as any);

// A previewed page must never run as this site: HTML is framed with every
// sandbox flag off, SVG goes through <img> (which never runs its scripts),
// and PDF keeps a plain frame because the browser's viewer refuses a sandbox.
describe('how a file is previewed', () => {
  it('frames HTML in a sandbox', () => {
    for (const name of ['index.html', 'report.HTM']) {
      expect(viewerMode(file(name))).toBe('frame');
      expect(isSandboxed(file(name))).toBe(true);
    }
  });

  it('shows SVG as an image, never a frame', () => {
    expect(viewerMode(file('plot.svg'))).toBe('image');
    expect(isSandboxed(file('plot.svg'))).toBe(false);
  });

  it('frames PDF without a sandbox', () => {
    expect(viewerMode(file('paper.pdf'))).toBe('frame');
    expect(isSandboxed(file('paper.pdf'))).toBe(false);
  });
});
