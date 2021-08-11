import React from 'react';
import { SectionHeader } from 'tapis-ui/_common';
import { Redirect } from 'react-router-dom';
import './ListSection.module.scss';
import { isExpired } from 'tapis-redux/utils';
import { useTapisConfig } from 'tapis-hooks';
import { useLogin } from 'tapis-hooks/authenticator';

export const ListSectionHeader: React.FC<React.PropsWithChildren<{ type?: string }> > = ({children, type}) => {
  return (
    <div styleName={type}>
      <SectionHeader>{children}</SectionHeader>
    </div>
  )
}

export const ListSectionBody: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div styleName="body">{children}</div>
}

export const ListSectionList: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div styleName="list">{children}</div>
}

export const ListSectionDetail: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div styleName="detail">{children}</div>
}

export const ListSection: React.FC<React.PropsWithChildren<{}> > = ({ children }) => {
  const { logout } = useLogin();
  const { accessToken } = useTapisConfig();
  if (!accessToken || isExpired(accessToken)) {
    logout();
    return <Redirect to="/login" />
  }
  return <div styleName="root">{children}</div>
}