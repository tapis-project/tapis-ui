import React from 'react';
import { TapisUIComponent } from 'tapis-ui/components';
import { TapisUIComponentProps } from 'tapis-ui/components/TapisUIComponent/TapisUIComponent';
import styles from './TapisUIList.module.scss';

type TapisUIListProps = React.PropsWithChildren<{
  onSelect?: (item: any) => any
} & TapisUIComponentProps>;


const TapisUIList: React.FC<TapisUIListProps> = ({isLoading, error, children}) => {
  return (
    <TapisUIComponent isLoading={isLoading} error={error} className={styles.list}>
      {children}
    </TapisUIComponent>
  )
};