/**
 * The accent button.
 *
 * The point of it is that it does NOT follow the button theme: "the primary
 * action" should not become quiet because someone switched styles. These pin
 * that, and the fact that ordinary buttons are untouched.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import PodBarButton from '../PodBarButton';
import { setPodsButtonTheme } from 'utils/podsButtonTheme';

const bg = (name: string) =>
  screen.getByRole('button', { name }).style.background;

describe('PodBarButton accent', () => {
  it('fills with blue while a plain button stays quiet', () => {
    render(
      <>
        <PodBarButton accent>submit job</PodBarButton>
        <PodBarButton>json</PodBarButton>
      </>
    );
    expect(bg('submit job')).toContain('rgb(21, 101, 192)');
    expect(bg('json')).not.toContain('rgb(21, 101, 192)');
  });

  it('keeps its colour when the button theme changes', () => {
    const { rerender } = render(<PodBarButton accent>submit job</PodBarButton>);
    const before = bg('submit job');
    setPodsButtonTheme('accent-bar');
    rerender(<PodBarButton accent>submit job</PodBarButton>);
    expect(bg('submit job')).toBe(before);
  });

  it('still honours disabled', () => {
    render(
      <PodBarButton accent disabled>
        submit job
      </PodBarButton>
    );
    expect(screen.getByRole('button', { name: 'submit job' })).toBeDisabled();
  });
});
