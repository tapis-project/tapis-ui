import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import AuthMethodsModal from './AuthMethodsModal';

describe('AuthMethodsModal', () => {
  it('tints this system twice: its method row AND its identity row', () => {
    renderComponent(
      <AuthMethodsModal
        open
        toggle={jest.fn()}
        highlight="TMS_KEYS"
        me="cgarcia"
        dynamic={true}
      />
    );
    // both applicable rows carry the tag — one for the method, one for who
    // you are on the host
    expect(screen.getAllByText('· this system')).toHaveLength(2);
    expect(screen.getByText('TMS_KEYS')).toBeInTheDocument();
    // the dynamic row speaks to the reader by name
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    // and says why the check refuses this method — design, not fault
    expect(
      screen.getByText(/TMS-managed keys refuse the dial/)
    ).toBeInTheDocument();
  });

  it('names the actual shared account on a static system', () => {
    renderComponent(
      <AuthMethodsModal
        open
        toggle={jest.fn()}
        highlight="PKI_KEYS"
        me="cgarcia"
        dynamic={false}
        account="harvest"
      />
    );
    expect(screen.getAllByText('· this system')).toHaveLength(2);
    // the row is about THIS system's account, not a made-up example
    expect(
      screen.getAllByText(/the shared account/).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/harvest/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/a fixed name/)).toBeNull();
  });

  it('stays generic when it does not know the system', () => {
    renderComponent(<AuthMethodsModal open toggle={jest.fn()} />);
    expect(screen.queryByText('· this system')).toBeNull();
    expect(screen.getByText(/a fixed name/)).toBeInTheDocument();
  });
});
