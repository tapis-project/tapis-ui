import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'utils/testing';
import Wizard from './Wizard';
import { Step } from '.';


describe('Wizard', () => {
  it('renders a wizard', async () => {
    const steps: Array<Step> = [
      {
        name: "First Step Name",
        component: <div>First Step Component</div>,
        complete: true
      },
      {
        name: "Second Step Name",
        component: <div>Second Step Component</div>,
        complete: false
      }
    ]

    renderComponent(
      <Wizard steps={steps}/>
    );

    expect(screen.getAllByText(/First Step Name/).length).toBe(1);
    const next = screen.getByTestId('next');
    await act(async () => {
      fireEvent.click(next)
    });

    expect(screen.getAllByText(/Second Step Component/).length).toBe(1);
  });
});
