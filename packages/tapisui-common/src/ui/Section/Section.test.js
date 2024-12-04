import React from 'react';
import { render } from '@testing-library/react';
import Section from '../Section';


describe('Section', () => {
  describe('elements and classes', () => {
    it('renders elements with appropriate roles', () => {
      const { getByRole } = render(
        <Section
          header="Header"
          content={<p>Content</p>}
        />
      );
      // WARNING: Only one `main` is allowed per page
      expect(getByRole('main').textContent).toEqual('Content');
      // NOTE: Technically (https://www.w3.org/TR/html-aria/#el-header), the `header` should not have a role, but `aria-query` recognizes it as a banner (https://github.com/A11yance/aria-query/pull/59)
      expect(getByRole('banner').textContent).toEqual('Header');
      expect(getByRole('heading').textContent).toEqual('Header');
    });
  });

  describe('content and classes', () => {
    it('renders all passed content and classes', () => {
      const { container, getByText } = render(
        <Section
          className="root-test"
          header="Header"
          headerActions={<button type="button">Header Actions</button>}
          headerClassName="header-test"
          content={<p>Content</p>}
          contentClassName="content-test"
          // sidebar={<nav>Sidebar</nav>}
          // sidebarClassName="sidebar-test"
          messages={<><strong>Message</strong><strong>List</strong></>}
          messagesClassName="messages-test"
        />
      );
      expect(container.getElementsByClassName('root-test').length).toEqual(1);
      expect(getByText('Header')).not.toEqual(null);
      expect(getByText('Header Actions')).not.toEqual(null);
      expect(container.getElementsByClassName('header-test').length).toEqual(1);
      expect(getByText('Content')).not.toEqual(null);
      expect(container.getElementsByClassName('content-test').length).toEqual(1);
      // expect(getByText('Sidebar')).not.toEqual(null);
      // expect(container.getElementsByClassName('sidebar-test').length).toEqual(1);
      expect(container.querySelector(`[class*="messages"]`)).not.toEqual(null);
      expect(container.getElementsByClassName('messages-test').length).toEqual(1);
    });
  });
});
