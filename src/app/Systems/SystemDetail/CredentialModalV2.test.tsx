import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import CredentialModalV2 from './CredentialModalV2';

jest.mock('@tapis/tapisui-hooks');

const system = (over: object = {}): Systems.TapisSystem =>
  ({
    id: 'frontera',
    systemType: 'LINUX',
    host: 'frontera.tacc.utexas.edu',
    effectiveUserId: 'cg-host',
    isDynamicEffectiveUser: false,
    defaultAuthnMethod: 'PASSWORD',
    ...over,
  } as never);

const credState = (over: object = {}) => ({
  create: jest.fn(),
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  reset: jest.fn(),
  invalidate: jest.fn(),
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'cgarcia' },
  });
  (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue(credState());
});

const renderModal = (over: object = {}) =>
  renderComponent(
    <CredentialModalV2 open toggle={jest.fn()} system={system(over)} />
  );

describe('CredentialModalV2', () => {
  it('knows where and who before a single keypress, and sends it whole', () => {
    const create = jest.fn();
    (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue(
      credState({ create })
    );
    renderModal();
    expect(screen.getByText('frontera.tacc.utexas.edu')).toBeInTheDocument();
    // static effectiveUserId is the default host account
    expect(screen.getByDisplayValue('cg-host')).toBeInTheDocument();
    // nothing typed yet: the press is closed
    const store = screen.getByRole('button', { name: /Store credential/ });
    expect(store).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'hunter2' },
    });
    expect(store).not.toBeDisabled();
    fireEvent.click(store);
    expect(create).toHaveBeenCalledWith(
      {
        systemId: 'frontera',
        userName: 'cg-host',
        reqUpdateCredential: { password: 'hunter2' },
      },
      expect.anything()
    );
  });

  it('keeps the secret behind the eye', () => {
    renderModal();
    const field = screen.getByLabelText('Password') as HTMLInputElement;
    expect(field.type).toBe('password');
    fireEvent.click(screen.getByLabelText('Show Password'));
    expect(field.type).toBe('text');
  });

  it('asks a PKI system for its pair, with the keygen lines to copy', () => {
    renderModal({ defaultAuthnMethod: 'PKI_KEYS' });
    // ed25519 leads; the RSA/PEM line stays for hosts that predate it —
    // each with its own copy press
    expect(screen.getByText('ssh-keygen -t ed25519')).toBeInTheDocument();
    expect(
      screen.getByText('ssh-keygen -t rsa -b 4096 -m PEM')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Copy: ssh-keygen -t ed25519')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Copy: ssh-keygen -t rsa -b 4096 -m PEM')
    ).toBeInTheDocument();
    // the two ways a pair silently fails: a passphrase, a missing pubkey
    expect(screen.getByText(/Skip the passphrase/)).toBeInTheDocument();
    expect(screen.getByText(/authorized_keys/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Private key/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Public key/)).toBeInTheDocument();
    // loginUser only matters on dynamic-user systems — this one is static
    expect(screen.queryByLabelText(/Login user/)).toBeNull();
  });

  it('offers loginUser on dynamic-user systems, defaulting to the tapis name', () => {
    renderModal({
      defaultAuthnMethod: 'PKI_KEYS',
      isDynamicEffectiveUser: true,
      effectiveUserId: '${apiUserId}',
    });
    expect(screen.getByDisplayValue('cgarcia')).toBeInTheDocument();
    expect(screen.getByLabelText(/Login user/)).toBeInTheDocument();
  });

  it('says a refusal in place and never locks the press', () => {
    (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue(
      credState({ isError: true, error: new Error('SYSAPI_CRED_INVALID') })
    );
    renderModal();
    expect(screen.getByText(/refused the credential/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'second-try' },
    });
    expect(
      screen.getByRole('button', { name: /Store credential/ })
    ).not.toBeDisabled();
  });

  it('lands on one door out: re-check access', () => {
    const toggle = jest.fn();
    (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue(
      credState({ isSuccess: true })
    );
    renderComponent(
      <CredentialModalV2 open toggle={toggle} system={system()} />
    );
    expect(screen.getByText('Credential stored.')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Done — re-check access/ })
    );
    expect(toggle).toHaveBeenCalled();
  });
});
