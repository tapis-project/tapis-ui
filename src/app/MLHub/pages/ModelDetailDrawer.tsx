import { useMemo, useState } from 'react';
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
import { ModelActionsBar } from './ModelDetailDrawerParts/ModelActionsBar';
import { ModelTabs, TabPanel } from './ModelDetailDrawerParts/ModelTabs';
import type { SectionTab } from './ModelDetailDrawerParts/ModelTabs';
import { GeneralSection } from './ModelDetailDrawerParts/Sections/GeneralSection';
import { DeploymentSection } from './ModelDetailDrawerParts/Sections/DeploymentSection';
import { SettingsSection } from './ModelDetailDrawerParts/Sections/SettingsSection';
import { modelAuthorFor } from '../modelMetadata';
import { JsonViewer } from '../_components/JsonViewer';

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
  const deploymentsQuery = Hooks.Deployments.useList();
  const deploymentOptionsQuery =
    Hooks.Models.useListExternalModelDeploymentOptions({
      externalModelId: summary.external_model_id,
      includeCount: true,
    });
  const model = query.data?.result;
  const displayedModel = model ?? summary;
  const deploymentCount = useMemo(
    () =>
      (deploymentsQuery.data?.result ?? []).filter(
        (deployment) =>
          deployment.external_model_id === summary.external_model_id
      ).length,
    [deploymentsQuery.data?.result, summary.external_model_id]
  );

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
            <SmartToyIcon />
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
            {model.description && (
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
                <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                  {model.description}
                </Typography>
              </Box>
            )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 0.75, sm: 2 },
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ModelTabs
                  currentTab={activeTab}
                  deploymentCount={
                    deploymentsQuery.isLoading ? undefined : deploymentCount
                  }
                  deploymentOptionsCount={
                    deploymentOptionsQuery.isLoading
                      ? undefined
                      : (deploymentOptionsQuery.data?.result ?? []).length
                  }
                  onChange={setActiveTab}
                />
              </Box>
              <ModelActionsBar model={model} />
            </Stack>
            <Divider />
            <Box sx={{ px: { xs: 2, sm: 3 } }}>
              <TabPanel value="general" currentTab={activeTab}>
                <GeneralSection model={model} />
              </TabPanel>
              <TabPanel value="deployment" currentTab={activeTab}>
                <DeploymentSection model={model} view="deployments" />
              </TabPanel>
              <TabPanel value="deployment-options" currentTab={activeTab}>
                <DeploymentSection model={model} view="options" />
              </TabPanel>
              <TabPanel value="settings" currentTab={activeTab}>
                <SettingsSection model={model} />
              </TabPanel>
              <TabPanel value="json" currentTab={activeTab}>
                <JsonViewer value={model} />
              </TabPanel>
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
