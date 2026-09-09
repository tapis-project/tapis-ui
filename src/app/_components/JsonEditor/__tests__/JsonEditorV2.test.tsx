import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import JsonEditorV2 from '../JsonEditorV2';

// CodeMirror is a contenteditable that jsdom cannot type into; a textarea
// with the same value/onChange contract stands in for it
jest.mock('@uiw/react-codemirror', () => {
  const ReactInFactory = require('react');
  return {
    __esModule: true,
    default: ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (next: string) => void;
      placeholder?: string;
    }) =>
      ReactInFactory.createElement('textarea', {
        'aria-label': 'JSON text',
        placeholder,
        value,
        onChange: (event: { target: { value: string } }) =>
          onChange(event.target.value),
      }),
  };
});

const job = { name: 'run', maxMinutes: 10 };

const setup = (validate?: (value: unknown) => string | undefined) => {
  const onApply = jest.fn();
  render(
    <JsonEditorV2
      value={job}
      applyLabel="Update the steps"
      onApply={onApply}
      validate={validate}
      placeholder="Paste a job here"
    />
  );
  return onApply;
};

const text = () => screen.getByLabelText('JSON text') as HTMLTextAreaElement;
const edit = (value: string) => fireEvent.change(text(), { target: { value } });
const press = (name: string) => screen.getByRole('button', { name });

describe('JsonEditorV2', () => {
  it('opens unchanged, its one action waiting for an edit', () => {
    setup();
    expect(text().value).toBe(JSON.stringify(job, null, 2));
    expect(screen.getByText('unchanged')).toBeInTheDocument();
    expect(press('Update the steps')).toBeDisabled();
    // nothing to go back to yet
    expect(screen.queryByRole('button', { name: 'Revert' })).toBeNull();
  });

  it('applies an edit as the parsed value', () => {
    const onApply = setup();
    edit(JSON.stringify({ ...job, maxMinutes: 20 }));
    expect(screen.getByText('edited')).toBeInTheDocument();
    fireEvent.click(press('Update the steps'));
    expect(onApply).toHaveBeenCalledWith({ name: 'run', maxMinutes: 20 });
  });

  it('counts the same job laid out differently as unchanged', () => {
    setup();
    edit(JSON.stringify(job));
    expect(screen.getByText('unchanged')).toBeInTheDocument();
    expect(press('Update the steps')).toBeDisabled();
  });

  it('says what is wrong with text that is not JSON, and will not apply it', () => {
    setup();
    edit('{ "name": ');
    expect(screen.getByText('not valid JSON')).toBeInTheDocument();
    expect(press('Update the steps')).toBeDisabled();
    expect(press('Format')).toBeDisabled();
  });

  it('shows what a validator refuses, and will not apply it', () => {
    const onApply = setup((value) =>
      value && typeof value === 'object' && !Array.isArray(value)
        ? undefined
        : 'Must be an object'
    );
    ['null', '5', '[]'].forEach((bad) => {
      edit(bad);
      expect(screen.getByText('not accepted')).toBeInTheDocument();
      expect(screen.getByText('Must be an object')).toBeInTheDocument();
      expect(press('Update the steps')).toBeDisabled();
      fireEvent.keyDown(text(), { key: 'Enter', metaKey: true });
    });
    expect(onApply).not.toHaveBeenCalled();
    edit('{"name":"ok"}');
    fireEvent.click(press('Update the steps'));
    expect(onApply).toHaveBeenCalledWith({ name: 'ok' });
  });

  it('clears for a paste, and reverts to what it opened with', () => {
    setup();
    fireEvent.click(press('Clear'));
    expect(text().value).toBe('');
    expect(text().placeholder).toBe('Paste a job here');
    expect(screen.getByText('empty')).toBeInTheDocument();
    fireEvent.click(press('Revert'));
    expect(text().value).toBe(JSON.stringify(job, null, 2));
  });

  it('formats, and copies the text as it stands', () => {
    setup();
    edit('{"a":1}');
    fireEvent.click(press('Format'));
    expect(text().value).toBe('{\n  "a": 1\n}');

    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    fireEvent.click(press('Copy'));
    expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('applies with ⌘↵ once there is an edit to apply', () => {
    const onApply = setup();
    fireEvent.keyDown(text(), { key: 'Enter', metaKey: true });
    expect(onApply).not.toHaveBeenCalled();
    edit(JSON.stringify({ name: 'other' }));
    fireEvent.keyDown(text(), { key: 'Enter', metaKey: true });
    expect(onApply).toHaveBeenCalledWith({ name: 'other' });
  });
});
