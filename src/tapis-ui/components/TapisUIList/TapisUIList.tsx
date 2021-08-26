import React, { useState, useCallback } from 'react';
import { TapisUIComponent } from 'tapis-ui/components';
import { TapisUIComponentProps } from 'tapis-ui/components/TapisUIComponent/TapisUIComponent';
import { Icon } from 'tapis-ui/_common';
import styles from './TapisUIList.module.scss';

type TapisUIListItemProps = React.PropsWithChildren<{
  data: any,
  icon?: string,
}>;

type TapisUIListItemPrivateProps = {
  onSelect: (data: any) => any,
  selected: boolean
} & TapisUIListItemProps;

const TapisUIListItemPrivate: React.FC<TapisUIListItemPrivateProps> = ({ 
  data, onSelect, icon='', selected, children }) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => onSelect && onSelect(data) }>
          <Icon name={icon} />
          <span className="nav-text">{children}</span>
        </div>
      </div>
    </li>
  ); 
}

export const TapisUIListItem: React.FC<TapisUIListItemProps> = ({ children }) => {
  return (
    <div>{children}</div>
  );
}

type TapisUIListProps = React.PropsWithChildren<{
  onSelect?: (data: any) => any
} & TapisUIComponentProps>;


export const TapisUIList: React.FC<TapisUIListProps> = ({onSelect, isLoading, error, children}) => {
  const [ selectedData, setSelectedData ] = useState<string>('');
  const selectCallback = useCallback(
    (data: any) => {
      setSelectedData(JSON.stringify(data));
      onSelect && onSelect(data);
    },
    [ setSelectedData, onSelect ]
  )

  const isSelected = (data: any) => {
    return JSON.stringify(data) === selectedData;
  }

  // Extract properties from TapisUIListItem children and
  // generate TapisUIListItemPrivate children with internal callback and
  // selected state
  const mappedChildren = React.Children.map(children, child => {
    // Checking isValidElement to insure that the child has props
    if (React.isValidElement(child)) {
      const { data, icon, children } = child.props;

      // If required props are missing, render as original child
      if (!!data || !!icon || !!children) {
        return child
      }

      return (
        <TapisUIListItemPrivate data={data} selected={isSelected(data)} onSelect={selectCallback} icon={icon}>
          {children}
        </TapisUIListItemPrivate>
      )
    }
    return child;
  });

  return (
    <TapisUIComponent isLoading={isLoading} error={error} className={styles.list}>
      {mappedChildren}
    </TapisUIComponent>
  )
};
