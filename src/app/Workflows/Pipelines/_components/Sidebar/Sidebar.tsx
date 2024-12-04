import { ArrowBack } from '@mui/icons-material';
import styles from './Sidebar.module.scss';

type SidebarProps = {
  title: string;
  toggle: () => void;
};

const Sidebar: React.FC<React.PropsWithChildren<SidebarProps>> = ({
  children,
  title,
  toggle,
}) => {
  return (
    <div className={styles['sidebar']}>
      <div className={styles['menu']}>
        <h2>{title}</h2>
        <ArrowBack onClick={toggle} className={styles['back']} />
      </div>
      {children}
    </div>
  );
};

export default Sidebar;
