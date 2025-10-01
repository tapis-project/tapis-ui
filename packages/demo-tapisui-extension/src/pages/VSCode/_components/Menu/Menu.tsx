import React from 'react';
import { Navbar, Nav, NavItem, Collapse, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import styles from './Menu.module.scss';

const Menu: React.FC = () => {
  return (
    <Navbar color="light" light expand={true}>
      <Collapse isOpen={true} navbar>
        <Nav className="me-auto" navbar>
          <NavItem className={styles['nav-item']}>
            <Link to="/vscode">
              <Button>
                <Icon name="dashboard"></Icon> Dashboard
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/vscode">
              <Button>
                <Icon name="simulation"></Icon> Analysis
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/vscode">
              <Button>
                <Icon name="search-folder"></Icon> Reports
              </Button>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default Menu;
