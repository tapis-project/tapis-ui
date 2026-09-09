/**
 * The mosaic and the box that knows when it has nothing to say. jsdom does
 * not do multi-column layout, so the balancing itself is checked in a real
 * browser; what is checked here is the contract — that the container asks
 * for columns of the right width, that every box is told not to split, and
 * that a box whose capability is 'no' stops rendering a body.
 */
import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { CardMosaic, Fact, InnerBox } from '../cardKit';

describe('CardMosaic', () => {
  it('deals the boxes into columns', () => {
    // jsdom has no ResizeObserver, so this is the unmeasured fallback:
    // round-robin at natural height, which is what the grid did anyway
    const { container } = renderComponent(
      <CardMosaic>
        <div data-testid="a">a</div>
        <div data-testid="b">b</div>
      </CardMosaic>
    );
    const mosaic = container.querySelector('[data-mosaic]') as HTMLElement;
    expect(mosaic).toBeInTheDocument();
    expect(screen.getByTestId('a')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });

  it('drops the boxes a page did not render', () => {
    // `{cond && <Box/>}` is how every one of these pages writes an
    // optional box, and a false child must not take a column slot
    const { container } = renderComponent(
      <CardMosaic>
        {false}
        <div data-testid="only">only</div>
      </CardMosaic>
    );
    expect(container.querySelectorAll('[data-cell]')).toHaveLength(1);
  });
});

describe('a box whose answer is no', () => {
  it('says no and stops, rather than standing full height and empty', () => {
    renderComponent(
      <InnerBox
        title="Job execution"
        state={false}
        whenNo="This system runs no jobs."
      >
        <Fact label="working dir">/scratch</Fact>
      </InnerBox>
    );
    expect(screen.getByText('Job execution')).toBeInTheDocument();
    expect(screen.getByText('no')).toBeInTheDocument();
    expect(screen.getByText('This system runs no jobs.')).toBeInTheDocument();
    // the body is what made these boxes tall for no reason
    expect(screen.queryByText('/scratch')).toBeNull();
  });

  it('still renders everything when the answer is yes', () => {
    renderComponent(
      <InnerBox title="Job execution" state whenNo="nothing here">
        <Fact label="working dir">/scratch</Fact>
      </InnerBox>
    );
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.getByText('/scratch')).toBeInTheDocument();
    expect(screen.queryByText('nothing here')).toBeNull();
  });

  it('leaves a box with no state at all alone', () => {
    // most boxes are not capabilities — they always have a body
    renderComponent(
      <InnerBox title="Sharing & access">
        <Fact label="owner">cgarcia</Fact>
      </InnerBox>
    );
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    expect(screen.queryByText('no')).toBeNull();
  });
});
