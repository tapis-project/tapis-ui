import { cleanup } from '@testing-library/react';
import renderComponent from 'utils/testing';
import DeleteSystemModal from './DeleteSystemModal';
import { useTapisConfig } from 'tapis-hooks';

afterEach(cleanup);

jest.mock('tapis-hooks');

describe('DeleteSystemModal', () => {
  it('render DeleteSystemModal component', () => {
    (useTapisConfig as jest.Mock).mockReturnValue({
      claims: { sub: '' },
    });
    const { getAllByText } = renderComponent(
      <DeleteSystemModal toggle={() => {}} />
    );
    expect(getAllByText('Delete system').length).toBeGreaterThanOrEqual(1);
  });
});
