/**
 * The wave splits a sentence into letters, which is exactly the shape that
 * breaks a screen reader if nobody thinks about it. These pin the parts that
 * are not decoration.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import WaveText from '../WaveText';

describe('WaveText', () => {
  it('says the whole phrase once, not one letter at a time', () => {
    render(<WaveText text="2 settings will not be sent" />);
    // the accessible name is the sentence ...
    const wave = screen.getByLabelText('2 settings will not be sent');
    // ... and every letter is hidden from the reader that would spell it out
    const letters = Array.from(wave.querySelectorAll('span'));
    expect(letters.length).toBeGreaterThan(10);
    letters.forEach((letter) =>
      expect(letter).toHaveAttribute('aria-hidden', 'true')
    );
  });

  it('keeps the text intact, spaces and all', () => {
    render(<WaveText text="a b" />);
    expect(screen.getByLabelText('a b')).toHaveTextContent('a b');
  });

  it('remounts when replay changes, so the wave travels again', () => {
    const { rerender } = render(<WaveText text="hello" replay="one" />);
    const first = screen.getByLabelText('hello');
    rerender(<WaveText text="hello" replay="two" />);
    expect(screen.getByLabelText('hello')).not.toBe(first);
  });

  // sx compiles to emotion classes, so these read the cascade; the shorthand
  // and the longhand are both checked because jsdom keeps one or the other
  const iterations = (text: string) => {
    const letter = screen.getByLabelText(text).querySelector('span')!;
    const style = window.getComputedStyle(letter);
    return `${style.animation} ${style.animationIterationCount}`;
  };

  it('keeps waving when asked to loop', () => {
    // the reminder lasts as long as the thing it is reminding you of
    render(<WaveText text="hi" loop />);
    expect(iterations('hi')).toMatch(/infinite/);
  });

  it('rests for a beat between waves, however long the text', () => {
    // the next wave sets off `rest` after the last letter lands: for "ok"
    // that is one bob, one stagger and the rest, 1040 + 45 + 350
    render(<WaveText text="ok" loop />);
    expect(iterations('ok')).toMatch(/1435ms|1\.435s/);
  });

  it('rests after its cycles when it is not a loop', () => {
    render(<WaveText text="yo" cycles={3} />);
    expect(iterations('yo')).not.toMatch(/infinite/);
    expect(iterations('yo')).toMatch(/\b3\b/);
  });
});
