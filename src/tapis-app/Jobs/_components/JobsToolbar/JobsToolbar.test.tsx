import { cleanup } from '@testing-library/react';
import renderComponent from 'utils/testing';
import JobsToolbar from './JobsToolbar';

afterEach(cleanup);

describe('JobsToolbar', () => {
  it('render JobsToolbar component', () => {
    const { getAllByLabelText } = renderComponent(<JobsToolbar jobUuid="" />);
    expect(getAllByLabelText('seeFiles').length).toBeGreaterThanOrEqual(1);
  });
});
