import React from 'react';
import { SectionHeader } from 'tapis-ui/src/_common';
import { useAuthenticator } from 'tapis-redux/src';
import { Redirect } from 'react-router-dom';
import styles from './ListSection.module.scss';
import { isExpired } from 'tapis-redux/src/utils';
import { useDispatch } from 'react-redux';

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
  const dispatch = useDispatch();
  const { token, logout } = useAuthenticator();
  if (!token || isExpired(token)) {
    dispatch(logout());
    return <Redirect to="/login" />
  }
  return <div className={styles.root}>{children}</div>
}