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
import { ModelActionsBar } from './ModelDetailDrawerParts/ModelActionsBar';
import { ModelTabs, TabPanel } from './ModelDetailDrawerParts/ModelTabs';
import type { SectionTab } from './ModelDetailDrawerParts/ModelTabs';
import { GeneralSection } from './ModelDetailDrawerParts/Sections/GeneralSection';
import { ComplianceSection } from './ModelDetailDrawerParts/Sections/ComplianceSection';
import { DeploymentSection } from './ModelDetailDrawerParts/Sections/DeploymentSection';
import { SettingsSection } from './ModelDetailDrawerParts/Sections/SettingsSection';
import { ExpandableTagCloud } from './ModelDetailDrawerParts/utils';
import { derivedMetadataFor, modelAuthorFor } from '../modelMetadata';

export interface ModelDetailDrawerProps {
  model: Models.Model | null;
  onClose: () => void;
}

function ModelDetailContent({
  summary,
  onClose,
}: {
  summary: Models.Model;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SectionTab>('general');
  const query = Hooks.Models.useGetModel({
    modelId: summary.id,
  });
  const model = query.data?.result;
  const displayedModel = model ?? summary;
  const derived = derivedMetadataFor(displayedModel);
  const platform = derived.deployment_strategies[0]?.platform;

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
              by {modelAuthorFor(displayedModel)}
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
                  {derivedMetadataFor(model).tags.length ? (
                    <ExpandableTagCloud
                      tags={derivedMetadataFor(model).tags}
                      showCount={4}
                    />
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
        <ModelDetailContent key={model.id} summary={model} onClose={onClose} />
      )}
    </Drawer>
  );
}
