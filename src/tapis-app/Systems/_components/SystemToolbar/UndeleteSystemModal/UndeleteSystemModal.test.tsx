import { cleanup } from '@testing-library/react';
import renderComponent from 'utils/testing';
import UndeleteSystemModal from './UndeleteSystemModal';

afterEach(cleanup);

describe('UndeleteSystemModal', () => {
  it('render UndeleteSystemModal component', () => {
    const { getAllByText } = renderComponent(
      <UndeleteSystemModal toggle={() => {}} />
    );
    expect(getAllByText('Re-add system').length).toBeGreaterThanOrEqual(1);
  });
});
