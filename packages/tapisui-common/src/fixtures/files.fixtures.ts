import { Files } from '@tapis/tapis-typescript';

export const fileInfo: Files.FileInfo = {
  name: 'file1.txt',
  path: '/file1.txt',
  size: 30000,
  type: 'file',
  lastModified: new Date('2020-01-01T12:00:00'),
};

export const fileBlob: File = new File(['(⌐□_□)'], 'file.png', {
  type: 'image/png',
});

export const fileStatInfo: Files.FileStatInfo = {
  absolutePath: '/home/testuser2/.viminfo',
  uid: 1003,
  gid: 1003,
  size: 14759,
  perms: 'rw-------',
  accessTime: new Date('2021-09-17T21:15:40Z').getTime() / 1000,
  modifyTime: new Date('2021-09-17T21:15:40Z').getTime() / 1000,
  dir: false,
  link: false,
};

export const transferTask: Files.TransferTask = {
  id: 165,
  username: 'cicsvc',
  tenantId: 'tacc',
  tag: 'transfer-1',
  uuid: '52404c37-5bc1-45d8-8a6c-43f175d952e2',
  status: Files.TransferTaskStatusEnum.Completed,
  estimatedTotalBytes: 0,
  totalBytesTransferred: 0,
  totalTransfers: 0,
  completeTransfers: 0,
  created: new Date('2021-10-21T17:26:44.639Z'),
  startTime: new Date('2021-10-21T17:26:44.665Z'),
  endTime: new Date('2021-10-21T17:26:45.479Z'),
};
