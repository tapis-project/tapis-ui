import * as Models from '@mlhub/models-ts-sdk';
import { useState, useContext, createContext, PropsWithChildren } from 'react';
import { useHistory } from 'react-router-dom';

type NavContextProps = {
  navigate: (path: string) => void;
  root: string;
};

// Create the context
const NavContext = createContext<NavContextProps | undefined>(undefined);

// Create a Provider wrapper component
export const NavContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const history = useHistory();
  const ROOT = '/mlhub';

  // Pass both state and updater into the value object
  return (
    <NavContext.Provider
      value={{
        navigate: (path: string) => {
          if (path === '/') {
            history.push(ROOT);
            return;
          }

          history.push(ROOT + path);
        },
        root: ROOT,
      }}
    >
      {children}
    </NavContext.Provider>
  );
};

export const useNavigate = () => {
  const context = useContext(NavContext);

  if (!context) {
    throw new Error('useNavigate must be used within a ModelFilterProvider');
  }

  return context;
};

export default NavContext;
