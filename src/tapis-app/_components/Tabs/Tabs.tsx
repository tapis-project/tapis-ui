import React, { useState } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import styles from './Tabs.module.scss';

type TabsProps = {
  tabs: { [name: string]: React.ReactNode };
  className?: string;
};

const Tabs: React.FC<TabsProps> = ({ tabs, className = '' }) => {
  const tabNames = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(tabNames[0] ?? '');

  const getTabClassname = (tabName: string) => {
    return `${styles.tab} ${activeTab === tabName ? styles.active : ''}`;
  };

  return (
    <div className={className}>
      <Nav tabs>
        {tabNames.map((tabName) => (
          <NavItem className={getTabClassname(tabName)} key={`tab-${tabName}`}>
            <NavLink
              onClick={() => setActiveTab(tabName)}
              data-testid={`tab-${tabName}`}
            >
              {tabName}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={activeTab}>
        {tabNames.map((tabName) => (
          <TabPane tabId={tabName} key={`tabcontent-${tabName}`}>
            {tabs[tabName]}
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
};

export default Tabs;
