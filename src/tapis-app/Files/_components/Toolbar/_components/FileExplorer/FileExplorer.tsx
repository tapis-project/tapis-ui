import { useCallback, useState, useEffect } from 'react';
import { Breadcrumbs } from 'tapis-ui/_common';
import { Systems } from '@tapis/tapis-typescript';
import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import FileListing from 'tapis-ui/components/files/FileListing';
import { OnNavigateCallback } from 'tapis-ui/components/files/FileListing/FileListing';
import { SystemListing } from 'tapis-ui/components/systems';
import { normalize } from 'path';
import styles from './FileExplorer.module.scss';

type FileExplorerProps = {
  systemId?: string;
  path?: string;
  className?: string;
  allowSystemChange?: boolean;
  onNavigate?: (systemId: string | null, path: string | null) => void;
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  systemId,
  path,
  className,
  onNavigate,
  allowSystemChange,
}) => {
  const [currentSystem, setCurrentSystem] = useState(systemId);
  const [currentPath, setCurrentPath] = useState(path);
  const [targetBreadcrumbs, setTargetBreadcrumbs] = useState<
    Array<BreadcrumbType>
  >([]);

  const onFileNavigate = useCallback<OnNavigateCallback>(
    (file) => {
      const newPath = normalize(`${currentPath}/${file.name!}`);
      setCurrentPath(newPath);
      onNavigate && onNavigate(currentSystem ?? null, newPath);
    },
    [setCurrentPath, currentPath, onNavigate, currentSystem]
  );

  const onSystemNavigate = useCallback(
    (system: Systems.TapisSystem | null) => {
      if (!system) {
        onNavigate && onNavigate(null, null);
      }
      setCurrentSystem(system?.id);
      setCurrentPath('/');
      onNavigate && onNavigate(system?.id ?? null, '/');
    },
    [setCurrentPath, setCurrentSystem, onNavigate]
  );

  useEffect(() => {
    const breadcrumbs: Array<BreadcrumbType> = breadcrumbsFromPathname(
      currentPath ?? ''
    );
    const newCrumbs: Array<BreadcrumbType> = breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      onClick: (to: string) => {
        setCurrentPath(to);
      },
    }));
    newCrumbs.unshift({
      text: currentSystem ?? '',
      to: '/',
      onClick: (to: string) => {
        setCurrentPath(to);
      },
    });
    setTargetBreadcrumbs(newCrumbs);
  }, [setTargetBreadcrumbs, currentPath, setCurrentPath, currentSystem]);

  const breadcrumbs: Array<BreadcrumbType> = [];
  if (allowSystemChange) {
    breadcrumbs.push({
      text: 'Files',
      to: '/',
      onClick: () => onSystemNavigate(null),
    });
  }

  if (currentSystem) {
    breadcrumbs.push(...targetBreadcrumbs);
  }

  return (
    <div className={className}>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div>
        {currentSystem ? (
          <FileListing
            className={`${styles['file-list']} ${styles['nav-list']}`}
            systemId={currentSystem}
            path={currentPath ?? '/'}
            onNavigate={onFileNavigate}
            fields={['size']}
          />
        ) : (
          <SystemListing
            className={styles['nav-list']}
            onNavigate={onSystemNavigate}
          />
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
