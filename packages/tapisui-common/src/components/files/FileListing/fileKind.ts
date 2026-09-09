/**
 * What a file is, as far as a listing needs to care.
 *
 * The old listing had three icons — file, folder, question mark — so a
 * directory of forty tapisjob.out, .err, .sbatch and .h5 files was forty
 * identical grey pages. Extension is a guess, but it is the guess every file
 * manager makes and it is right often enough to be worth a glance.
 */
import { Files } from '@tapis/tapis-typescript';

export type FileKind =
  | 'dir'
  | 'linkDir'
  | 'linkFile'
  | 'image'
  | 'archive'
  | 'code'
  | 'doc'
  | 'data'
  | 'log'
  | 'binary'
  | 'file'
  | 'unknown';

const BY_EXTENSION: Record<string, FileKind> = {};
const register = (kind: FileKind, extensions: string[]) =>
  extensions.forEach((extension) => {
    BY_EXTENSION[extension] = kind;
  });

register('image', [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'svg',
  'webp',
  'tif',
  'tiff',
]);
register('archive', ['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'zst', '7z']);
register('code', [
  'py',
  'sh',
  'bash',
  'c',
  'cpp',
  'h',
  'hpp',
  'f90',
  'r',
  'jl',
  'js',
  'ts',
  'tsx',
  'go',
  'rs',
  'java',
  'sbatch',
  'slurm',
  'makefile',
]);
register('doc', ['md', 'txt', 'rst', 'pdf', 'doc', 'docx', 'rtf', 'tex']);
register('data', [
  'json',
  'yaml',
  'yml',
  'csv',
  'tsv',
  'xml',
  'h5',
  'hdf5',
  'nc',
  'parquet',
  'npy',
  'npz',
  'db',
  'sqlite',
]);
register('log', ['log', 'out', 'err', 'stdout', 'stderr']);
register('binary', ['so', 'o', 'a', 'exe', 'bin', 'wasm', 'sif', 'img']);

export const fileExtension = (name?: string): string => {
  const clean = (name ?? '').replace(/\/+$/, '');
  const dot = clean.lastIndexOf('.');
  // a leading dot is a hidden file, not an extension: .bashrc is not a "bashrc"
  if (dot <= 0 || dot === clean.length - 1) return '';
  return clean.slice(dot + 1).toLowerCase();
};

/**
 * What a symbolic link points at, as far as a listing can tell.
 *
 * Tapis reports the link, not its target: there is a SYMBOLIC_LINK type and
 * nothing that says whether the far end is a directory. The one clue is
 * nativePermissions when the service passes through a mode string with its
 * leading type character — `d` for a directory, `-` for a file.
 *
 * With no clue at all it is called a directory, and that is a judgement
 * rather than a fact: on an HPC filesystem the links people meet are almost
 * all to directories ($WORK, $SCRATCH, a project share), and guessing that
 * way puts them where they were before the listing started sorting, which is
 * beside the directories rather than adrift among the files.
 */
export const linkTarget = (file: Files.FileInfo): 'dir' | 'file' => {
  const mode = file.nativePermissions ?? '';
  if (mode.startsWith('d')) return 'dir';
  if (mode.startsWith('-')) return 'file';
  // a mime type is something only a readable file has
  if (file.mimeType && !/directory/i.test(file.mimeType)) return 'file';
  return 'dir';
};

/**
 * Behaves like a directory: sorts with them, opens into them, and is not
 * something the viewer can show you.
 */
export const isDirLike = (file: Files.FileInfo): boolean =>
  file.type === Files.FileTypeEnum.Dir ||
  (file.type === Files.FileTypeEnum.SymbolicLink && linkTarget(file) === 'dir');

/**
 * The type a selection filter judges a file by.
 *
 * Every filter in the app names two types, `dir` and `file`, and a filter
 * asking for directories means "places an operation can land" — which a
 * symbolic link to one is, so links answer for their target rather than as a
 * third kind of thing no filter ever names. Judged by the raw type they
 * answered to nothing, and down a sorted listing that read as the tick box
 * randomly refusing every few rows. Sockets, devices and the API's unknowns
 * return nothing: no filter means them, and no Tapis operation would take
 * one anyway.
 */
export const effectiveType = (
  file: Files.FileInfo
): 'dir' | 'file' | undefined => {
  if (file.type === Files.FileTypeEnum.Dir) return 'dir';
  if (file.type === Files.FileTypeEnum.File) return 'file';
  if (file.type === Files.FileTypeEnum.SymbolicLink) return linkTarget(file);
  return undefined;
};

export const fileKind = (file: Files.FileInfo): FileKind => {
  if (file.type === Files.FileTypeEnum.Dir) return 'dir';
  if (file.type === Files.FileTypeEnum.SymbolicLink) {
    return linkTarget(file) === 'dir' ? 'linkDir' : 'linkFile';
  }
  if (
    file.type === Files.FileTypeEnum.Other ||
    file.type === Files.FileTypeEnum.Unknown
  ) {
    return 'unknown';
  }
  return BY_EXTENSION[fileExtension(file.name)] ?? 'file';
};

/**
 * Muted on purpose. A listing is read as a column of names; the icons are
 * there to be caught out of the corner of an eye, not to compete with them.
 */
export const KIND_COLOR: Record<FileKind, string> = {
  dir: '#c9971c',
  // A link wears the colour of what it points at, because the glyph is that
  // thing with a chain badge on it rather than a chain on its own.
  linkDir: '#c9971c',
  linkFile: '#8b8b8b',
  image: '#3f8f6e',
  archive: '#9a6b3f',
  code: '#5b6fb5',
  doc: '#6b7280',
  data: '#7a5aa8',
  log: '#8a6d00',
  binary: '#7a7a7a',
  file: '#8b8b8b',
  unknown: '#a0a0a0',
};

export const KIND_LABEL: Record<FileKind, string> = {
  dir: 'Folder',
  linkDir: 'Folder (symlink)',
  linkFile: 'File (symlink)',
  image: 'Image',
  archive: 'Archive',
  code: 'Source or script',
  doc: 'Document',
  data: 'Data',
  log: 'Log or job output',
  binary: 'Binary',
  file: 'File',
  unknown: 'Unknown',
};
