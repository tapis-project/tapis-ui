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
            <Link to="/data-labeler">
              <Button>
                <Icon name="dashboard"></Icon> Dashboard
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/data-labeler/datasets">
              <Button>
                <Icon name="data-files"></Icon> Datasets
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/data-labeler/auto">
              <Button>
                <Icon name="simulation"></Icon> Auto-Labeler
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/data-labeler/manual">
              <Button>
                <Icon name="user"></Icon> Manual-Labeler
              </Button>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default Menu;
