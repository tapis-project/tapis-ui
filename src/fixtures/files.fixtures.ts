import { Files } from '@tapis/tapis-typescript';

export const fileInfo: Files.FileInfo = {
  name: 'file1.txt',
  path: '/file1.txt',
  size: 30000,
  type: 'file',
  lastModified: new Date('2020-01-01T12:00:00'),
};

export const fileStatInfo: Files.FileStatInfo = {
  absolutePath: "/home/testuser2/.viminfo",
  uid: 1003,
  gid: 1003,
  size: 14759,
  perms: "rw-------",
  accessTime: new Date("2021-09-17T21:15:40Z").getTime() / 1000,
  modifyTime: new Date("2021-09-17T21:15:40Z").getTime() / 1000,
  dir: false,
  link: false
}