/**
 * /components — the house order over a deliberately disparate kit.
 *
 * Pages invent pieces where they need them (that is fine and good); this
 * page is where the pieces get named, dated and placed so the growth stays
 * legible. Catalog: every button, rail, chip and box with its origin file,
 * its adopters, and a live example when it stands alone. Flows: measured
 * request timelines for the paging strategies the sources choose between.
 *
 * An admin/dev surface: reachable at #/components, deliberately not in the
 * sidebar.
 */
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import styles from 'app/_components/PageShell/PageShell.module.scss';
import PageHeaderTitle, {
  PageHeaderRow,
} from 'app/_components/PageShell/PageHeaderTitle';
import { CatalogTab } from '../_components/catalog';
import FlowsTab from '../_components/FlowsTab';

const TABS = [
  { id: 'catalog', label: 'Catalog' },
  { id: 'flows', label: 'Flows' },
] as const;

const Layout: React.FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('catalog');
  return (
    <div className={styles['page-root']}>
      <div className={styles['page-header']}>
        <PageHeaderRow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PageHeaderTitle to="/components">Components</PageHeaderTitle>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              the house kit, cataloged — and the fetch flows, measured
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {TABS.map((t) => (
              <Box
                key={t.id}
                component="button"
                type="button"
                onClick={() => setTab(t.id)}
                sx={{
                  px: 1,
                  py: 0.25,
                  fontSize: '0.7rem',
                  fontWeight: tab === t.id ? 700 : 400,
                  border: '1px solid',
                  borderColor: tab === t.id ? '#1565c0' : 'divider',
                  color: tab === t.id ? '#1565c0' : 'text.secondary',
                  bgcolor: 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                {t.label}
              </Box>
            ))}
          </Box>
        </PageHeaderRow>
      </div>
      <div className={styles['content-row']}>
        <div className={styles['right-pane']}>
          <div className={styles['work-content']}>
            <Box sx={{ pb: 2, maxWidth: 1160 }}>
              {tab === 'catalog' ? <CatalogTab /> : <FlowsTab />}
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
