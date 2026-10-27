import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TuneIcon from '@mui/icons-material/Tune';
import StarIcon from '@mui/icons-material/Star';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Settings } from '@mui/icons-material';

export type SectionTab =
  | 'general'
  | 'deployment'
  | 'deployment-options'
  | 'settings'
  | 'json';

interface TabItem {
  value: SectionTab;
  label: string;
  icon: React.ReactElement;
}

const TABS: ReadonlyArray<TabItem> = [
  { value: 'general', label: 'General', icon: <StarIcon fontSize="small" /> },
  {
    value: 'deployment',
    label: 'Deployments',
    icon: <RocketLaunchIcon fontSize="small" />,
  },
  {
    value: 'deployment-options',
    label: 'Deployment options',
    icon: <TuneIcon fontSize="small" />,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: <Settings fontSize="small" />,
  },
  { value: 'json', label: 'JSON', icon: <DataObjectIcon fontSize="small" /> },
];

interface TabPanelProps {
  value: SectionTab;
  currentTab: SectionTab;
  children: React.ReactNode;
}

export function TabPanel({ value, currentTab, children }: TabPanelProps) {
  const visible = value === currentTab;
  return (
    <div
      role="tabpanel"
      hidden={!visible}
      id={`model-section-${value}`}
      aria-labelledby={`model-tab-${value}`}
    >
      {visible && (
        <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ModelTabsProps {
  currentTab: SectionTab;
  deploymentCount?: number;
  deploymentOptionsCount?: number;
  onChange: (tab: SectionTab) => void;
  children?: React.ReactNode;
}

export function ModelTabs({
  currentTab,
  deploymentCount,
  deploymentOptionsCount,
  onChange,
  children,
}: ModelTabsProps) {
  const handleChange = (_: React.SyntheticEvent, newValue: SectionTab) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTabs-indicator': {
            height: 2,
          },
          minHeight: 64,
        }}
      >
        {TABS.map((tab) => {
          const count =
            tab.value === 'deployment'
              ? deploymentCount
              : tab.value === 'deployment-options'
              ? deploymentOptionsCount
              : undefined;

          return (
            <Tab
              key={tab.value}
              id={`model-tab-${tab.value}`}
              aria-controls={`model-section-${tab.value}`}
              value={tab.value}
              label={
                count !== undefined ? (
                  <Box
                    component="span"
                    sx={{
                      alignItems: 'center',
                      display: 'inline-flex',
                      gap: 0.75,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Box component="span">{tab.label}</Box>
                    <Box
                      component="span"
                      sx={{
                        alignItems: 'center',
                        bgcolor: 'primary.main',
                        borderRadius: '10px',
                        color: 'primary.contrastText',
                        display: 'inline-flex',
                        fontSize: 11,
                        fontWeight: 700,
                        height: 20,
                        justifyContent: 'center',
                        minWidth: 20,
                        px: 0.5,
                      }}
                    >
                      {count}
                    </Box>
                  </Box>
                ) : (
                  tab.label
                )
              }
              icon={tab.icon}
              iconPosition="start"
              sx={{
                minHeight: 64,
                minWidth: { xs: 96, sm: 108 },
                px: 1,
                py: 0.5,
                fontWeight: 500,
                textTransform: 'none',
              }}
            />
          );
        })}
      </Tabs>
      {children}
    </Box>
  );
}
