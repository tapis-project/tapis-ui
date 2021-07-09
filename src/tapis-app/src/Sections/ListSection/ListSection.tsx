import React from 'react';
import { SectionHeader } from 'tapis-ui/_common';
import './ListSection.module.scss';

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

export const ListSection: React.FC<SectionProps> = ({ children }) => {
  return <div styleName="root">{children}</div>
}