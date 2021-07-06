import React from 'react';
import { SectionHeader } from 'tapis-ui/_common';
import './ListSection.module.scss';
import './ListSection.scss';

interface SectionProps {
  name: string,
  list: React.ReactNode,
  detail?: React.ReactNode
}

const ListSection: React.FC<SectionProps> = ({ name, list, detail }) => {
  return (
    <div styleName="root">
      <SectionHeader>{name}</SectionHeader>
      <div styleName="container">
        {
          React.isValidElement(list) && React.cloneElement(list, { className: 'list-section__list'})
        }
        {
          React.isValidElement(detail) && React.cloneElement(detail, { className: 'list-section__detail'})
        }
      </div>
    </div>
  )
}

export default ListSection;