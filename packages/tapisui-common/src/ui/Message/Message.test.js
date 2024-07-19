import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Message, * as MSG from '../../ui/Message';

const TEST_CONTENT = '…';
const TEST_TYPE = 'info';
const TEST_SCOPE = 'inline';

function testClassnamesByType(type, getByRole, getByTestId) {
  const root = getByRole('status');
  const icon = getByRole('img'); // WARNING: Relies on `Icon`
  const text = getByTestId('text');
  const iconName = MSG.TYPE_MAP[type].iconName;
  const modifierClassName = MSG.TYPE_MAP[type].className;
  expect(root.className).toMatch('container');
  expect(root.className).toMatch(new RegExp(modifierClassName));
  expect(icon.className).toMatch(iconName);
  expect(text.className).toMatch('text');
}

describe('Message', () => {
  it.each(MSG.TYPES)('has correct text for type %s', type => {
    if (type === 'warn') console.warn = jest.fn(); // mute deprecation warning
    const { getByTestId } = render(
      <Message
        type={type}
        scope={TEST_SCOPE}
      >
        {TEST_CONTENT}
      </Message>
    );
    expect(getByTestId('text').textContent).toEqual(TEST_CONTENT);
  });

  describe('elements', () => {
    test.each(MSG.TYPES)('include icon when type is %s', type => {
      if (type === 'warn') console.warn = jest.fn(); // mute deprecation warning
      const { getByRole } = render(
        <Message
          type={type}
          scope={TEST_SCOPE}
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(getByRole('img')).toBeDefined(); // WARNING: Relies on `Icon`
    });
    test.each(MSG.TYPES)('include text when type is %s', type => {
      if (type === 'warn') console.warn = jest.fn(); // mute deprecation warning
      const { getByTestId } = render(
        <Message
          type={type}
          scope={TEST_SCOPE}
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(getByTestId('text')).toBeDefined();
    });
    test('include button when message is dismissible', () => {
      const { getByRole } = render(
        <Message
          type={TEST_TYPE}
          scope="section"
          canDismiss
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(getByRole('button')).not.toEqual(null);
    });
  });

  describe('visibility', () => {
    test('invisible when `isVisible` is `false`', () => {
      const { queryByRole } = render(
        <Message
          type={TEST_TYPE}
          scope="section"
          isVisible={false}
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
    test.todo('visible when `isVisible` changes from `false` to `true`');
    // FAQ: Feature works (manually tested), but unit test is difficult
    // it('appears when isVisible changes from true to false', async () => {
    //   let isVisible = false;
    //   const { findByRole, queryByRole } = render(
    //     <Message
    //       type={TEST_TYPE}
    //       scope="section"
    //       isVisible={isVisible}
    //     >
    //       {TEST_CONTENT}
    //     </Message>
    //   );
    //   expect(queryByRole('button')).toBeNull();
    //   const button = await findByRole('button');
    //   isVisible = true;
    //   expect(button).toBeDefined();
    // });
  });

  describe('className', () => {
    it.each(MSG.TYPES)('is accurate when type is %s', type => {
      const { getByRole, getByTestId } = render(
        <Message
          type={type}
          scope={TEST_SCOPE}
        >
          {TEST_CONTENT}
        </Message>
      );

      testClassnamesByType(type, getByRole, getByTestId);
    });
    it.each(MSG.SCOPES)('has accurate className when scope is "%s"', scope => {
      const { getByRole, getByTestId } = render(
        <Message
          type={TEST_TYPE}
          scope={scope}
        >
          {TEST_CONTENT}
        </Message>
      );
      const root = getByRole('status');
      const modifierClassName = MSG.SCOPE_MAP[scope || MSG.DEFAULT_SCOPE];

      testClassnamesByType(TEST_TYPE, getByRole, getByTestId);
      expect(root.className).toMatch(new RegExp(modifierClassName));
    });
  });

  describe('property limitation', () => {
    test('is announced for `canDismiss` and `scope`', () => {
      console.error = jest.fn();
      render(
        <Message
          type={TEST_TYPE}
          scope="inline"
          canDismiss
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(console.error).toHaveBeenCalledWith(
        MSG.ERROR_TEXT.mismatchCanDismissScope
      );
    });
    test('is announced for `type="warn"`', () => {
      console.info = jest.fn();
      render(
        <Message
          type="warn"
          scope={TEST_SCOPE}
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(console.info).toHaveBeenCalledWith(
        MSG.ERROR_TEXT.deprecatedType
      );
    });
    test('is announced for missing `scope` value', () => {
      console.info = jest.fn();
      render(
        <Message
          type={TEST_TYPE}
        >
          {TEST_CONTENT}
        </Message>
      );
      expect(console.info).toHaveBeenCalledWith(
        MSG.ERROR_TEXT.missingScope
      );
    });
  });
});
