import { reducer } from './NotificationsProvider';
import { NotificationRecord } from '.';

const record1: NotificationRecord = {
  id: 'record1',
  notification: {
    icon: 'data-files',
    message: 'Preparing Download',
  },
  read: false,
};

let state: Array<NotificationRecord> = [];

describe('NotificationsProvider', () => {
  beforeEach(() => {
    state = [{ ...record1 }];
  });
  it('should run mark notifications as read', () => {
    expect(reducer(state, { operation: 'markread', id: 'record1' })).toEqual([
      {
        ...record1,
        read: true,
      },
    ]);
  });
  it('should add a notification', () => {
    const notification = {
      icon: 'data-files',
      message: 'Starting Download',
    };
    expect(
      reducer(state, { operation: 'add', id: 'record2', notification })
    ).toEqual([
      {
        id: 'record2',
        read: false,
        notification,
      },
      record1,
    ]);
  });
  it('should replace a notification', () => {
    const notification = {
      icon: 'data-files',
      message: 'Replacement message',
    };
    expect(
      reducer(state, { operation: 'set', id: 'record1', notification })
    ).toEqual([
      {
        id: 'record1',
        read: false,
        notification,
      },
    ]);
  });
  it('should remove a notification', () => {
    expect(reducer(state, { operation: 'remove', id: 'record1' })).toEqual([]);
  });
});
