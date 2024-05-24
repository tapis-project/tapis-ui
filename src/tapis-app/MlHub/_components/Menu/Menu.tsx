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
            <Link to="/ml-hub">
              <Button>
                <Icon name="dashboard"></Icon> Dashboard
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/ml-hub/models">
              <Button>
                <Icon name="simulation"></Icon> Models
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/ml-hub/datasets">
              <Button>
                <Icon name="search-folder"></Icon> Datasets
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/ml-hub/inference">
              <Button>
                <Icon name="multiple-coversation"></Icon> Inference
              </Button>
            </Link>
          </NavItem>
          <NavItem className={styles['nav-item']}>
            <Link to="/ml-hub/training">
              <Button>
                <Icon name="data-processing"></Icon> Training
              </Button>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default Menu;
