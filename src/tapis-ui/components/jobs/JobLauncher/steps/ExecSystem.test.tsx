import '@testing-library/jest-dom/extend-expect';
import { useFormContext } from 'react-hook-form';
/* eslint-disable-next-line */
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useDetails, useList } from 'tapis-hooks/systems';
import { tapisSystem } from 'fixtures/systems.fixtures';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import { ExecSystem } from './ExecSystem';

jest.mock('react-hook-form');
jest.mock('tapis-hooks/systems');
jest.mock('react-hook-form');
jest.mock('tapis-ui/utils/forms');

describe('ExecSystem job launcher step', () => {
  beforeEach(() => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [{ ...tapisSystem }],
      },
      isLoading: false,
      error: null,
    });
    (useDetails as jest.Mock).mockReturnValue({
      data: {
        result: { ...tapisSystem },
      },
      isLoading: false,
      error: null,
    });
    (useFormContext as jest.Mock).mockReturnValue({
      register: jest.fn(),
      formState: {
        errors: {},
      },
      getValues: jest.fn().mockReturnValue({
        execSystemId: 'testuser2.execution',
      }),
    });
  });
  it('loads the default queue', async () => {
    const { getAllByText } = renderComponent(<ExecSystem app={tapisApp} />);
    expect(getAllByText(/testuser2.execution/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(getAllByText(/tapisNormal/).length).toBeGreaterThanOrEqual(1);
  });
});
