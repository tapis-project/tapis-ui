import '@testing-library/jest-dom/extend-expect';
import { tapisSystem } from 'fixtures/systems.fixtures';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import { ExecSystem } from './ExecSystem';
import { useFormContext } from 'react-hook-form';
/* eslint-disable-next-line */
import { mapInnerRef } from 'tapis-ui/utils/forms';

jest.mock('react-hook-form');
jest.mock('tapis-ui/utils/forms');

describe('ExecSystem job launcher step', () => {
  beforeEach(() => {
    (useFormContext as jest.Mock).mockReturnValue({
      register: jest.fn(),
      formState: {
        errors: {},
      },
      setValue: jest.fn(),
    });
  });
  it('loads the default queue', async () => {
    const systems = [tapisSystem];
    const { getAllByText } = renderComponent(
      <ExecSystem app={tapisApp} systems={systems} />
    );
    expect(getAllByText(/testuser2.execution/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(getAllByText(/tapisNormal/).length).toBeGreaterThanOrEqual(1);
  });
});
