import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { ModelHeader } from './ModelHeader';
import { ModelTabs, TabPanel } from './ModelTabs';
import type { SectionTab } from './ModelTabs';
import { GeneralSection } from './Sections/GeneralSection';
import { InferenceSection } from './Sections/InferenceSection';
import { TrainingSection } from './Sections/TrainingSection';
import { ArchitectureSection } from './Sections/ArchitectureSection';
import { IOSection } from './Sections/IOSection';
import { ComplianceSection } from './Sections/ComplianceSection';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';

const ModelDetailsSkeleton = () => {
  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          width={72}
          height={72}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={32} />
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={48} />
        <Divider sx={{ my: 1 }} />
        <Skeleton
          variant="rectangular"
          height={220}
          sx={{ borderRadius: 2, mt: 2 }}
        />
      </Box>
    </Card>
  );
};

export function ModelDetailsPage() {
  const params = useParams<{ author: string; name: string }>();
  const author = params.author ?? undefined;
  const name = params.name ?? undefined;
  const { data, isLoading, error } = Hooks.Models.useGetModel({ author, name });
  const model = data?.result;

  const [activeTab, setActiveTab] = useState<SectionTab>('general');

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <ModelDetailsSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Failed to load model
          </Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!model) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            Model not found
          </Typography>
          <Typography variant="body2">
            No model found matching author "{author}" and name "{name}".
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Card>
        {/* Header */}
        <ModelHeader model={model} />

        <Divider />

        {/* Tabs */}
        <Box sx={{ px: { xs: 2, md: 3, xl: 4 } }}>
          <ModelTabs currentTab={activeTab} onChange={setActiveTab}>
            <TabPanel value="general" currentTab={activeTab}>
              <GeneralSection model={model} />
            </TabPanel>
            <TabPanel value="inference" currentTab={activeTab}>
              <InferenceSection model={model} />
            </TabPanel>
            <TabPanel value="training" currentTab={activeTab}>
              <TrainingSection model={model} />
            </TabPanel>
            <TabPanel value="architecture" currentTab={activeTab}>
              <ArchitectureSection model={model} />
            </TabPanel>
            <TabPanel value="io" currentTab={activeTab}>
              <IOSection model={model} />
            </TabPanel>
            <TabPanel value="compliance" currentTab={activeTab}>
              <ComplianceSection model={model} />
            </TabPanel>
          </ModelTabs>
        </Box>
      </Card>
    </Container>
  );
}

export default ModelDetailsPage;
