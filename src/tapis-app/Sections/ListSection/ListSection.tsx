import React from 'react';
import { SectionHeader } from 'tapis-ui/_common';
import { useLogin } from 'tapis-hooks/authenticator';
import { useTapisConfig } from 'tapis-hooks';
import { Redirect } from 'react-router-dom';
import styles from './ListSection.module.scss';

export const ListSectionHeader: React.FC<React.PropsWithChildren<{ type?: string }> > = ({children, type}) => {
  return (
    <div className={type && styles[type]}>
      <SectionHeader>{children}</SectionHeader>
    </div>
  )
}

export const ListSectionBody: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div className={styles.body}>{children}</div>
}

export const ListSectionList: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div className={styles.list}>{children}</div>
}

export const ListSectionDetail: React.FC<React.PropsWithChildren<{}> > = ({children}) => {
  return <div className={styles.detail}>{children}</div>
}

export const ListSection: React.FC<React.PropsWithChildren<{}> > = ({ children }) => {
  const { logout } = useLogin();
  const { accessToken } = useTapisConfig();
  if (!accessToken) {
    logout();
    return <Redirect to="/login" />
  }
  return <div className={styles.root}>{children}</div>
}