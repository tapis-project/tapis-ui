import { cleanup } from '@testing-library/react';
import SystemToolbar from './SystemToolbar';
import renderComponent from 'utils/testing';

afterEach(cleanup);

describe('SystemToolbar', () => {
  it('render SystemToolbar component', () => {
    const { getAllByText } = renderComponent(<SystemToolbar />);
    expect(getAllByText('Create').length).toEqual(1);
  });
});
