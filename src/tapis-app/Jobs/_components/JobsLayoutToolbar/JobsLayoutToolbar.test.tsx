import { cleanup } from '@testing-library/react';
import renderComponent from 'utils/testing';
import JobsLayoutToolbar from './JobsLayoutToolbar';

afterEach(cleanup);

describe('JobsLayoutToolbar', () => {
  it('render JobsLayoutToolbar component', () => {
    const { getAllByLabelText } = renderComponent(<JobsLayoutToolbar />);
    expect(getAllByLabelText('hideJob').length).toBeGreaterThanOrEqual(1);
  });
});
