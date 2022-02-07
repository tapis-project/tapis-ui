import '@testing-library/jest-dom/extend-expect';
import { tapisSystem } from 'fixtures/systems.fixtures';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import useJobLauncher from '../components/useJobLauncher';
import { ExecSystem } from './ExecSystem';
import { useFormContext } from 'react-hook-form';
/* eslint-disable-next-line */
import { mapInnerRef } from 'tapis-ui/utils/forms';

jest.mock('react-hook-form');
jest.mock('tapis-ui/utils/forms');
jest.mock('../components/useJobLauncher');

describe('ExecSystem job launcher step', () => {
  beforeEach(() => {
    (useFormContext as jest.Mock).mockReturnValue({
      register: jest.fn(),
      formState: {
        errors: {},
      },
      setValue: jest.fn(),
    });
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {},
      app: tapisApp,
      systems: [tapisSystem],
    });
  });
  it('loads the default queue', async () => {
    const { getAllByText } = renderComponent(<ExecSystem />);
    expect(getAllByText(/testuser2.execution/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(getAllByText(/tapisNormal/).length).toBeGreaterThanOrEqual(1);
  });
});
