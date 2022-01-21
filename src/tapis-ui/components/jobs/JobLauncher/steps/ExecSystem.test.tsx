import '@testing-library/jest-dom/extend-expect';
import { tapisSystem } from 'fixtures/systems.fixtures';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import { ExecSystem } from './ExecSystem';

describe('ExecSystem job launcher step', () => {
  it('loads the default queue', async () => {
    const systems = [tapisSystem];
    const { getAllByText } = renderComponent(
      <ExecSystem app={tapisApp} systems={systems} />
    );
    expect(getAllByText(/testuser2.execution/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(getAllByText(/tapisNormal/).length).toBeGreaterThanOrEqual(1);
  });
});
