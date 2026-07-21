import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import ArchitectureIcon from '@mui/icons-material/Architecture';
import GppGoodIcon from '@mui/icons-material/GppGood';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import SpeedIcon from '@mui/icons-material/Speed';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StarIcon from '@mui/icons-material/Star';

export type SectionTab =
  | 'general'
  | 'inference'
  | 'training'
  | 'architecture'
  | 'io'
  | 'compliance'
  | 'deployment';

interface TabItem {
  value: SectionTab;
  label: string;
  icon: React.ReactElement;
}

const TABS: ReadonlyArray<TabItem> = [
  { value: 'general', label: 'General', icon: <StarIcon fontSize="small" /> },
  {
    value: 'inference',
    label: 'Inference',
    icon: <SpeedIcon fontSize="small" />,
  },
  {
    value: 'training',
    label: 'Training',
    icon: <SchoolIcon fontSize="small" />,
  },
  {
    value: 'architecture',
    label: 'Architecture',
    icon: <ArchitectureIcon fontSize="small" />,
  },
  { value: 'io', label: 'Model I/O', icon: <SwapHorizIcon fontSize="small" /> },
  {
    value: 'compliance',
    label: 'Compliance',
    icon: <GppGoodIcon fontSize="small" />,
  },
  {
    value: 'deployment',
    label: 'Deployment',
    icon: <RocketLaunchIcon fontSize="small" />,
  },
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
  onChange: (tab: SectionTab) => void;
  children: React.ReactNode;
}

export function ModelTabs({ currentTab, onChange, children }: ModelTabsProps) {
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
          minHeight: 48,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            id={`model-tab-${tab.value}`}
            aria-controls={`model-section-${tab.value}`}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{
              minWidth: 120,
              fontWeight: 500,
              textTransform: 'none',
            }}
          />
        ))}
      </Tabs>
      {children}
    </Box>
  );
}
