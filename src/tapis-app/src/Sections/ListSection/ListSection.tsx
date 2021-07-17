import React from 'react';
import { SectionHeader } from 'tapis-ui/_common';
import { useAuthenticator } from 'tapis-redux';
import { Redirect } from 'react-router-dom';
import './ListSection.module.scss';
import { isExpired } from 'tapis-redux/utils';
import { useDispatch } from 'react-redux';

interface SectionProps {
  children: React.ReactNode[] | React.ReactNode
}

interface SectionHeaderProps {
  children: React.ReactNode[] | React.ReactNode
  type?: string
}

export const ListSectionHeader: React.FC<SectionHeaderProps> = ({children, type}) => {
  return (
    <div styleName={type}>
      <SectionHeader>{children}</SectionHeader>
    </div>
  )
}

export const ListSectionBody: React.FC<SectionProps> = ({children}) => {
  return <div styleName="body">{children}</div>
}

export const ListSectionList: React.FC<SectionProps> = ({children}) => {
  return <div styleName="list">{children}</div>
}

export const ListSectionDetail: React.FC<SectionProps> = ({children}) => {
  return <div styleName="detail">{children}</div>
}

export const ListSectionListFull: React.FC<SectionProps> = ({ children }) => {
  return <div styleName="list-full">{children}</div>
};

export const ListSectionDetailHalf: React.FC<SectionProps> = ({children}) => {
  return <div styleName="detail-half">{children}</div>
}



export const ListSection: React.FC<SectionProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, logout } = useAuthenticator();
  if (!token || isExpired(token)) {
    dispatch(logout());
    return <Redirect to="/login" />
  }
  return <div styleName="root">{children}</div>
}

