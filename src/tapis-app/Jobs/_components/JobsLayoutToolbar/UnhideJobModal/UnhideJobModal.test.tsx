import { cleanup } from '@testing-library/react';
import renderComponent from 'utils/testing';
import UnhideJobModal from './UnhideJobModal';

afterEach(cleanup);

describe('UnhideJobModal', () => {
  it('render UnhideJobModal component', () => {
    const { getAllByLabelText } = renderComponent(
      <UnhideJobModal toggle={() => {}} />
    );
    expect(getAllByLabelText('jobUuid').length).toBeGreaterThanOrEqual(1);
  });
});
