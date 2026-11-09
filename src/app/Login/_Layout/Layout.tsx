import React, { useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { Login as TapisLogin } from '../_components';
import JwtBypassDialog, {
  jwtBypassAllowed,
  useLongPress,
} from '../_components/JwtBypassDialog';
import { PageLayout } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import styles from './Layout.module.scss';

// The login page doubles as the landing page, so it should always say what
// this thing is — generic copy lives in ../defaults (shared with LoginDialog).
import { DEFAULT_DESCRIPTION, DEFAULT_LINKS } from '../defaults';

const Layout: React.FC = () => {
  const { accessToken, basePath, pathTenantId } = useTapisConfig();
  const { extension } = useExtension();
  let location = useLocation<{ from: Location }>();
  const from = location.state?.from;
  const landingRoute = extension?.serviceMap?.['home']?.route;

  // JWT bypass lives on the login page itself (not the sidebar) so it stays
  // reachable whatever mix of auth methods a deployment offers. Trigger: hold
  // the logo block or the sign-in section for 3 s; on for every tenant unless
  // the deployment turns it off (jwtBypassAllowed). A completed hold opens the
  // dialog over the button, so the release never lands as a click on it.
  const [showJwtBypass, setShowJwtBypass] = useState(false);
  const bypassAllowed = jwtBypassAllowed(extension ?? undefined, pathTenantId);
  const holdHandlers = useLongPress(() => setShowJwtBypass(true), 3000);

  if (accessToken?.access_token) {
    const wanted = from?.pathname && from.pathname !== '/' ? from : undefined;
    return <Redirect to={wanted ?? landingRoute ?? '/'} />;
  }

  const host = basePath.replace('https://', '').replace('http://', '');
  const page = extension?.loginPage;
  const description = page?.description ?? DEFAULT_DESCRIPTION;
  const links = page?.links ?? DEFAULT_LINKS;
  const logoSrc =
    extension?.logo?.filePath || extension?.logo?.url || './logo_tapis.png';
  const hold = bypassAllowed ? holdHandlers : {};

  // The about block sits open on the page and only the sign-in is boxed, all
  // on one left edge, so a long tagline and description (or none) lays out
  // the same way.
  const body = (
    <div className={styles['landing']}>
      <div className={styles['head']}>
        <div className={styles['logoRow']} {...hold}>
          <img className={styles['logo']} src={logoSrc} alt="" />
        </div>
        <div className={styles['hostRow']}>
          <span className={styles['host']}>{host}</span>
        </div>
        {page?.tagline && (
          <div className={styles['tagline']}>{page.tagline}</div>
        )}
        <div className={styles['description']}>{description}</div>
      </div>
      <div className={styles['signInCard']} {...hold}>
        <div className={styles['signInTitle']}>Sign in</div>
        <TapisLogin />
      </div>
      {links.length > 0 && (
        <div className={styles['links']}>
          {links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      )}
      {bypassAllowed && (
        <JwtBypassDialog
          open={showJwtBypass}
          onClose={() => setShowJwtBypass(false)}
        />
      )}
    </div>
  );

  return <PageLayout right={body} />;
};

export default Layout;
