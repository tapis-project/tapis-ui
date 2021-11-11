import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import NotificationToast, { getToastMessage } from './Toast';
import { initialState as notifications } from '../../redux/reducers/notifications.reducers';
import { initialSystemState } from '../../redux/reducers/datafiles.reducers';
import systemsFixture from '../DataFiles/fixtures/DataFiles.systems.fixture';
import { projectsFixture } from '../../redux/sagas/fixtures/projects.fixture';
import {
  dataFilesRename,
  dataFilesError,
  dataFilesUpload,
  dataFilesUploadToSharedWorkSpace
} from '../../redux/sagas/fixtures/notificationsDataFilesEvents.fixture';
import {
  jobStatusUpdatePending,
  jobInteractiveSessionReady
} from '../../redux/sagas/fixtures/notificationsJobsEvents.fixture';

const mockStore = configureStore();

const exampleToasts = [
  {
    pk: '1',
    event_type: 'job',
    message: 'This is a test message',
    extra: {
      name: 'RStudio-Stampede2-1.1.423u4_2020-08-04T22:55:35-dcvserver',
      status: 'RUNNING'
    }
  },
  {
    pk: '2',
    event_type: 'job',
    message: 'This is another test message',
    extra: {
      name: 'RStudio-Stampede2-1.1.423u4_2020-08-04T22:55:35-dcvserver',
      status: 'FINISHED'
    }
  }
];

const getToastStore = eventToasts => {
  return {
    systems: systemsFixture,
    projects: projectsFixture,
    notifications: {
      ...notifications,
      list: {
        ...notifications.list,
        toasts: eventToasts
      }
    }
  };
};

describe('Notification Toast', () => {
  it('shows no toast on init', () => {
    const { queryByRole } = renderComponent(
      <NotificationToast />,
      mockStore({ notifications, systems: initialSystemState })
    );
    expect(queryByRole('alert')).toBeNull();
  });

  it('shows first toast in array', () => {
    const { queryByRole } = renderComponent(
      <NotificationToast />,
      mockStore(getToastStore(exampleToasts))
    );
    expect(queryByRole('alert')).toBeDefined();
    expect(queryByRole('alert')).toHaveTextContent(
      /RStudio-S...cvserver is now running/
    );
    expect(queryByRole('alert')).not.toHaveTextContent(
      /RStudio-S...cvserver finished successfully/
    );
  });

  it('shows toast including system information', () => {
    const { queryByRole } = renderComponent(
      <NotificationToast />,
      mockStore(getToastStore([dataFilesUpload]))
    );
    expect(queryByRole('alert')).toHaveTextContent(
      'File uploaded to My Data (Frontera)/'
    );
  });

  it('shows toast including system information for shared workspace', () => {
    const { queryByRole } = renderComponent(
      <NotificationToast />,
      mockStore(getToastStore([dataFilesUploadToSharedWorkSpace]))
    );
    expect(queryByRole('alert')).toHaveTextContent(
      /File uploaded to Test Project Title\//
    );
  });

  it('shows toast for data file error', () => {
    const { queryByRole } = renderComponent(
      <NotificationToast />,
      mockStore(getToastStore([dataFilesError]))
    );
    expect(queryByRole('alert')).toHaveTextContent(/Move failed/);
  });
});

describe('getToastMessage', () => {
  it('returns expected job response', () => {
    expect(getToastMessage(jobStatusUpdatePending)).toEqual(
      'RStudio-S...cvserver is processing'
    );
  });

  it('returns expected interactive_session_ready response', () => {
    expect(getToastMessage(jobInteractiveSessionReady)).toEqual(
      'RStudio-S...cvserver ready to view.'
    );
  });

  it('returns expected data_files responses', () => {
    expect(getToastMessage(dataFilesRename)).toEqual(
      'File renamed to test2.png'
    );
    expect(getToastMessage(dataFilesError)).toEqual('Move failed');
  });
});
