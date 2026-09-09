import { reducer } from './NotificationsProvider';
import { AppNotification } from '.';

const notification1: AppNotification = {
  id: 'notif-1',
  title: 'Test',
  message: 'Test message',
  severity: 'info',
  timestamp: Date.now(),
  dismissed: false,
};

let state: AppNotification[] = [];

describe('NotificationsProvider', () => {
  beforeEach(() => {
    state = [{ ...notification1 }];
  });
  it('should add a notification', () => {
    const newNotif: AppNotification = {
      id: 'notif-2',
      title: 'New',
      message: 'New message',
      severity: 'success',
      timestamp: Date.now(),
      dismissed: false,
    };
    expect(reducer(state, { type: 'ADD', notification: newNotif })).toEqual([
      newNotif,
      notification1,
    ]);
  });
  it('should dismiss a notification', () => {
    expect(reducer(state, { type: 'DISMISS', id: 'notif-1' })).toEqual([
      { ...notification1, dismissed: true },
    ]);
  });
  it('should dismiss all notifications', () => {
    const state2 = [{ ...notification1 }, { ...notification1, id: 'notif-2' }];
    const result = reducer(state2, { type: 'DISMISS_ALL' });
    expect(result.every((n) => n.dismissed)).toBe(true);
  });
  it('should remove a notification', () => {
    expect(reducer(state, { type: 'REMOVE', id: 'notif-1' })).toEqual([]);
  });
  it('should clear all notifications', () => {
    expect(reducer(state, { type: 'CLEAR' })).toEqual([]);
  });
  it('should cap at 50 notifications', () => {
    const big: AppNotification[] = Array.from({ length: 50 }, (_, i) => ({
      ...notification1,
      id: `notif-${i}`,
    }));
    const newNotif: AppNotification = {
      ...notification1,
      id: 'notif-new',
    };
    const result = reducer(big, { type: 'ADD', notification: newNotif });
    expect(result.length).toBe(50);
    expect(result[0].id).toBe('notif-new');
  });
});
