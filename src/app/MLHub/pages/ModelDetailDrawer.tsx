import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { DatasetProviderIcon } from '../_components';
import { ModelActionsBar } from './ModelDetailsPage/ModelActionsBar';
import { ModelTabs, TabPanel } from './ModelDetailsPage/ModelTabs';
import type { SectionTab } from './ModelDetailsPage/ModelTabs';
import { GeneralSection } from './ModelDetailsPage/Sections/GeneralSection';
import { ComplianceSection } from './ModelDetailsPage/Sections/ComplianceSection';
import { DeploymentSection } from './ModelDetailsPage/Sections/DeploymentSection';
import { SettingsSection } from './ModelDetailsPage/Sections/SettingsSection';
import { ExpandableTagCloud } from './ModelDetailsPage/utils';

export interface ModelDetailDrawerProps {
  model: Models.ModelMetadata | null;
  onClose: () => void;
}

function ModelDetailContent({
  summary,
  onClose,
}: {
  summary: Models.ModelMetadata;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SectionTab>('general');
  const query = Hooks.Models.useGetModel({
    author: summary.author,
    name: summary.name,
  });
  const model = query.data?.result;
  const displayedModel = model ?? summary;
  const platform = displayedModel.canonical?.platform;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexShrink: 0,
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'primary.main',
              height: 42,
              width: 42,
            }}
          >
            {platform ? (
              <DatasetProviderIcon provider={platform} size={27} />
            ) : (
              <SmartToyIcon />
            )}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
              {displayedModel.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              by {displayedModel.author}
              {displayedModel.tenant_id
                ? ` · tenant ${displayedModel.tenant_id}`
                : ''}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          aria-label="Close model details"
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {query.isLoading && <LinearProgress />}

        {query.isError && (
          <Alert severity="error" sx={{ m: 3 }}>
            {query.error instanceof Error
              ? query.error.message
              : 'Unable to load model details.'}
          </Alert>
        )}

        {!query.isLoading && !query.isError && model && (
          <>
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
              {model.description && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {model.description}
                </Typography>
              )}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  {model.tags?.length ? (
                    <ExpandableTagCloud tags={model.tags} showCount={4} />
                  ) : null}
                </Box>
                <ModelActionsBar model={model} />
              </Stack>
            </Box>
            <Divider />
            <Box sx={{ px: { xs: 2, sm: 3 } }}>
              <ModelTabs currentTab={activeTab} onChange={setActiveTab}>
                <TabPanel value="general" currentTab={activeTab}>
                  <GeneralSection model={model} />
                </TabPanel>
                <TabPanel value="compliance" currentTab={activeTab}>
                  <ComplianceSection model={model} />
                </TabPanel>
                <TabPanel value="deployment" currentTab={activeTab}>
                  <DeploymentSection model={model} />
                </TabPanel>
                <TabPanel value="settings" currentTab={activeTab}>
                  <SettingsSection model={model} />
                </TabPanel>
              </ModelTabs>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export function ModelDetailDrawer({ model, onClose }: ModelDetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(model)}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          bgcolor: 'background.default',
          height: '100%',
          maxWidth: 1100,
          width: '92vw',
        },
      }}
    >
      {model && (
        <ModelDetailContent
          key={`${model.author}/${model.name}`}
          summary={model}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
}
