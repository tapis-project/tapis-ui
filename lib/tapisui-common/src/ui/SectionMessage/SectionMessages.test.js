import React from 'react';
import { render } from '@testing-library/react';
import { Alert } from 'reactstrap';
import SectionMessages from '../Section/SectionMessages';
import * as MESSAGES from '../../constants/welcomeMessages';


describe('SectionMessages', () => {
  describe('content and classes', () => {
    it('renders passed children and class', () => {
      const { container, getByText } = render(
        <SectionMessages className="root-test">
          <Alert>Message 1</Alert>
          <Alert>Message 2</Alert>
        </SectionMessages>
      );

      expect(getByText('Message 1')).not.toEqual(null);
      expect(getByText('Message 2')).not.toEqual(null);
      expect(container.getElementsByClassName('root-test').length).toEqual(1);
    });
  });

  describe('weclome message', () => {
    it('renders known welcome message', () => {
      const { getByText } = render(
        <SectionMessages routeName="DASHBOARD" />
      );
      expect(getByText(MESSAGES['DASHBOARD'])).not.toEqual(null);
    });

    it('renders known welcome message but with custom message', () => {
      const { getByText, queryByText } = render(
        <SectionMessages routeName="DASHBOARD" welcomeText="Hello" />
      );
      expect(queryByText(MESSAGES['DASHBOARD'])).toEqual(null);
      expect(getByText('Hello')).not.toEqual(null);
    });

    it('renders custom welcome message', () => {
      const { getByText } = render(
        <SectionMessages welcomeText="Hello" />
      );
      expect(getByText('Hello')).not.toEqual(null);
    });
  });
});
