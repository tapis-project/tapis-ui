import { Files } from '@tapis/tapis-typescript';
import type {
  FileExplorerBreadcrumb,
  FileExplorerItem,
} from '@tapis/tapisui-common';

export const normalizeFilePath = (path?: string) => {
  const segments = (path || '/').split('/').filter(Boolean);
  return `/${segments.join('/')}`;
};

export const joinFilePath = (parent: string, name: string) =>
  normalizeFilePath(`${parent}/${name}`);

export const toFilesV2Route = (systemId: string, path = '/') => {
  const encodedPath = normalizeFilePath(path)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  const base = `/files/v2/${encodeURIComponent(systemId)}`;
  return encodedPath ? `${base}/${encodedPath}` : base;
};

export const pathFromRouteParam = (path?: string) => {
  if (!path) return '/';
  return normalizeFilePath(
    path
      .split('/')
      .filter(Boolean)
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      })
      .join('/')
  );
};

export const fileInfoPath = (file: Files.FileInfo, parentPath: string) =>
  normalizeFilePath(file.path || joinFilePath(parentPath, file.name || ''));

export const toFileExplorerItem = (
  file: Files.FileInfo,
  parentPath: string
): FileExplorerItem => {
  const name = file.name || file.path?.split('/').filter(Boolean).pop() || '';
  const path = fileInfoPath(file, parentPath);
  const extension = name.includes('.') ? name.split('.').pop() : undefined;
  return {
    id: path,
    name,
    type: file.type === Files.FileTypeEnum.Dir ? 'directory' : 'file',
    parentId: normalizeFilePath(parentPath),
    size: (file.size || 0) * 1024,
    mimeType: file.mimeType,
    extension,
    createdAt: file.lastModified?.toISOString?.() || new Date(0).toISOString(),
    updatedAt: file.lastModified?.toISOString?.() || new Date(0).toISOString(),
    author: file.owner,
    metadata: {
      group: file.group,
      nativePermissions: file.nativePermissions,
      tapisType: file.type,
      path,
    },
  };
};

export const filesV2Breadcrumbs = (
  systemId: string,
  path: string
): FileExplorerBreadcrumb[] => {
  const segments = normalizeFilePath(path).split('/').filter(Boolean);
  const breadcrumbs: FileExplorerBreadcrumb[] = [
    { id: '/', name: systemId, path: '/' },
  ];
  let current = '';
  segments.forEach((segment) => {
    current = `${current}/${segment}`;
    breadcrumbs.push({ id: current, name: segment, path: current });
  });
  return breadcrumbs;
};
