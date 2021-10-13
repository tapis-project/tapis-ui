import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import { Systems } from '@tapis/tapis-typescript';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTapisConfig } from 'tapis-hooks';
import renderComponent from 'utils/testing';
import TapisProvider from 'tapis-hooks/provider';
import details from 'tapis-api/systems/details';
import useDetails from './useDetails';

jest.mock('tapis-api/systems/details');
jest.mock('tapis-hooks');

(useTapisConfig as jest.Mock).mockReturnValue(
  {
    basePath: 'test.path',
    accessToken: 'testToken'
  }
)

describe('Systems Details', () => {
  it('Returns systems details', async () => {
    (details as jest.Mock).mockImplementation(
      (): Promise<Systems.RespSystem> => Promise.resolve(
        {
          result: tapisSystem
        }
      )
    );
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <TapisProvider basePath="test.path">
        {children}
      </TapisProvider>
    );
    const { result, waitFor} = renderHook(() => useDetails('tapis.system'), { wrapper });
    await waitFor(() => result.current.isSuccess || result.current.isError);
    expect(details).toBeCalled();
    expect(result.current.data).toEqual({ result: tapisSystem });
  });
});
