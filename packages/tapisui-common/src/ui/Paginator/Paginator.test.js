import React from 'react';
import { render } from '@testing-library/react';
import Paginator from '../Paginator';

describe('Paginator', () => {
  it('renders pages', () => {
    const { getAllByText } = render(<Paginator pages={20} current={11} callback={() => {}} />);
    expect(getAllByText('1').length).toEqual(1);
    expect(getAllByText('9').length).toEqual(1);
    expect(getAllByText('10').length).toEqual(1);
    expect(getAllByText('11').length).toEqual(1);
    expect(getAllByText('12').length).toEqual(1);
    expect(getAllByText('13').length).toEqual(1);
    expect(getAllByText('...').length).toEqual(2);
    expect(getAllByText('20').length).toEqual(1);
  });
});
