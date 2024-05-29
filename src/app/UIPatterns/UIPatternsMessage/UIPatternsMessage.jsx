import React from 'react';
import { InlineMessage, SectionMessage } from '@tapis/tapisui-common';
import styles from './UIPatternsMessage.module.scss';

const EXAMPLE_LINK = {
  short: (
    <a
      href={window.location.href}
      onClick={(e) => e.preventDefault()}
      className="wb-link"
    >
      Example link
    </a>
  ),
  long: (
    <a
      href={window.location.href}
      onClick={(e) => e.preventDefault()}
      className="wb-link"
    >
      Example link can be a complete sentence.
    </a>
  ),
};
const EXAMPLE_TEXT = {
  info: {
    short: 'You exist.',
    long: 'All your information, are belong to us.',
  },
  success: {
    short: 'We did well.',
    long: 'All your success, are belong to us.',
  },
  warn: {
    short: 'You did poorly.',
    long: 'All your warning, are come from us.',
  },
  error: {
    short: 'You failed.',
    long: 'All your error, are belong to you.',
  },
};

const NOTIFICATION_TEXT = (
  <em>
    Can not render in isolation. See{' '}
    <a
      href="https://xd.adobe.com/view/db2660cc-1011-4f26-5d31-019ce87c1fe8-ad17/screen/3821fc3e-bda1-40d4-9e50-a514e90aa088/"
      target="_blank"
      rel="noreferrer"
    >
      Adobe Design.
    </a>
  </em>
);

function UIPatternsMessages() {
  return (
    <table className={styles.container}>
      <thead>
        <tr>
          <th scope="row" className={styles.secondary}>
            component
          </th>
          <th scope="col">
            <code>&lt;InlineMessage&gt;</code>
            <code>&lt;Message scope=&quot;inline&quot;&gt;</code>
          </th>
          <th scope="col">
            <code>&lt;SectionMessage (canDismiss)&gt;</code>
            <code>&lt;Message scope=&quot;section&quot; (canDismiss)&gt;</code>
          </th>
          <th scope="col">
            <code>
              <s>&lt;AppMessage&gt;</s>
            </code>
            <code>&lt;NotifcationToast&gt;</code>
          </th>
        </tr>
        <tr>
          <th scope="row" className={styles.secondary}>
            <code>scope</code>
          </th>
          <th scope="col">
            <code>inline</code>
          </th>
          <th scope="col">
            <code>section</code>
          </th>
          <th scope="col">
            <code>app</code>
          </th>
        </tr>
        <tr>
          <th scope="col" className={styles.secondary}>
            <code>type</code>
          </th>
          <td>
            When to Use
            <ul>
              <li>action result statement in table row</li>
              <li>message when table can not load data</li>
            </ul>
          </td>
          <td>
            When to Use
            <ul>
              <li>warning at the top of a form</li>
              <li>message after successful submission of form</li>
            </ul>
          </td>
          <td>
            When to Use
            <ul>
              <li>user action is required</li>
              <li>important user-initiated action is completed</li>
              <li>security concern</li>
              <li>milestone for time-sensitive activity</li>
            </ul>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">
            <code>info</code>
          </th>
          <td>
            <InlineMessage type="info">
              {EXAMPLE_TEXT.info.long} {EXAMPLE_LINK.short}
            </InlineMessage>
            <hr />
            <InlineMessage type="info">
              {EXAMPLE_TEXT.info.short} {EXAMPLE_LINK.long}
            </InlineMessage>
          </td>
          <td>
            <SectionMessage type="info">
              {EXAMPLE_TEXT.info.long} {EXAMPLE_LINK.short}
            </SectionMessage>
            <SectionMessage type="info" canDismiss>
              {EXAMPLE_TEXT.info.short} {EXAMPLE_LINK.long}
            </SectionMessage>
          </td>
          <td rowSpan="2">{NOTIFICATION_TEXT}</td>
        </tr>
        <tr>
          <th scope="row">
            <code>success</code>
          </th>
          <td>
            <InlineMessage type="success">
              {EXAMPLE_TEXT.success.long} {EXAMPLE_LINK.short}
            </InlineMessage>
            <hr />
            <InlineMessage type="success">
              {EXAMPLE_TEXT.success.short} {EXAMPLE_LINK.long}
            </InlineMessage>
          </td>
          <td>
            <SectionMessage type="success">
              {EXAMPLE_TEXT.success.long} {EXAMPLE_LINK.short}
            </SectionMessage>
            <SectionMessage type="success" canDismiss>
              {EXAMPLE_TEXT.success.short} {EXAMPLE_LINK.long}
            </SectionMessage>
          </td>
          {/* <td /> */}
        </tr>
        <tr>
          <th scope="row">
            <code>warn</code>
          </th>
          <td>
            <InlineMessage type="warn">
              {EXAMPLE_TEXT.warn.long} {EXAMPLE_LINK.short}
            </InlineMessage>
            <hr />
            <InlineMessage type="warn">
              {EXAMPLE_TEXT.warn.short} {EXAMPLE_LINK.long}
            </InlineMessage>
          </td>
          <td>
            <SectionMessage type="warn">
              {EXAMPLE_TEXT.warn.long} {EXAMPLE_LINK.short}
            </SectionMessage>
            <SectionMessage type="warn" canDismiss>
              {EXAMPLE_TEXT.warn.short} {EXAMPLE_LINK.long}
            </SectionMessage>
          </td>
          <td rowSpan="2" className={styles['is-row-end']}>
            {NOTIFICATION_TEXT}
          </td>
        </tr>
        <tr>
          <th scope="row">
            <code>error</code>
          </th>
          <td>
            <InlineMessage type="error">
              {EXAMPLE_TEXT.error.long} {EXAMPLE_LINK.short}
            </InlineMessage>
            <hr />
            <InlineMessage type="error">
              {EXAMPLE_TEXT.error.short} {EXAMPLE_LINK.long}
            </InlineMessage>
          </td>
          <td>
            <SectionMessage type="error">
              {EXAMPLE_TEXT.error.long} {EXAMPLE_LINK.short}
            </SectionMessage>
            <SectionMessage type="error" canDismiss>
              {EXAMPLE_TEXT.error.short} {EXAMPLE_LINK.long}
            </SectionMessage>
          </td>
          {/* <td /> */}
        </tr>
      </tbody>
    </table>
  );
}

export default UIPatternsMessages;
