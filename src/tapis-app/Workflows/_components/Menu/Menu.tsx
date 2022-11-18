import React from "react"
import {
    Navbar,
    Nav,
    NavItem,
    Collapse,
    Button,
} from "reactstrap"
import { Link } from "react-router-dom"
import { Icon } from "tapis-ui/_common"
import styles from "./Menu.module.scss"

const Menu: React.FC = () => {
  return (
    <Navbar color="light" light expand={true}>
      <Collapse isOpen={true} navbar>
        <Nav className="me-auto" navbar>
          <NavItem className={styles["nav-item"]}>
            <Link to="/workflows">
              <Button><Icon name="dashboard"></Icon> Dashboard</Button>
            </Link>
          </NavItem>
          <NavItem className={styles["nav-item"]}>
            <Link to="/workflows/pipelines">
              <Button>Pipelines</Button>
            </Link>
          </NavItem>
          <NavItem className={styles["nav-item"]}>
            <Link to="/workflows/groups">
              <Button>Groups</Button>
            </Link>
          </NavItem>
          <NavItem className={styles["nav-item"]}>
            <Link to="/workflows/archives">
              <Button>Archives</Button>
            </Link>
          </NavItem>
          <NavItem className={styles["nav-item"]}>
            <Link to="/workflows/identities">
              <Button>Identities</Button>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  )
}

export default Menu