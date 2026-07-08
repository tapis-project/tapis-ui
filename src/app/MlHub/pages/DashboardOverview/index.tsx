import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { Model, Deployment, Artifact, Dataset } from '../../types';
import { inferenceBackendColorMap } from '../../enums';

// ── Sub-components (one per visual section)
import KpiStatCards from './_components/KpiStatCards';
import QuickActionsCard from './_components/QuickActionsCard';
import ModelStatusBreakdown from './_components/ModelStatusBreakdown';
import FrameworkPieChart from './_components/FrameworkPieChart';
import DeploymentStatusChart from './_components/DeploymentStatusChart';
import RecentModelsList from './_components/RecentModelsList';
import RecentDeploymentsList from './_components/RecentDeploymentsList';
import FrameworkBarChartModal from './_components/FrameworkBarChartModal';
import DeploymentDialog from '../../_components/DeploymentDialog';
import ArtifactDialog from '../../_components/ArtifactDialog';
import { useTapisConfig } from '@tapis/tapisui-hooks';

interface DashboardOverviewProps {
  models: Model[];
  deployments: Deployment[];
  artifacts: Artifact[];
  datasets: Dataset[];
  onRegisterModel?: () => void;
}

export default function DashboardOverview({
  models,
  deployments,
  artifacts,
  datasets,
  onRegisterModel,
}: DashboardOverviewProps) {
  // ─── Framework bar-chart modal ──────────────────────────
  const [frameworkModalOpen, setFrameworkModalOpen] = React.useState(false);

  // ─── Quick-action dialogs ─────────────────────────────
  const [deploymentOpen, setDeploymentOpen] = React.useState(false);
  const [artifactOpen, setArtifactOpen] = React.useState(false);

  // --- Username
  const { username } = useTapisConfig();

  const handleSaveArtifact = React.useCallback(
    (artifact: Omit<Artifact, 'id' | 'createdAt' | 'checksum' | 'status'>) => {
      const newArtifact: Artifact = {
        ...artifact,
        id: `artifact-${Date.now()}`,
        createdAt: new Date().toISOString(),
        checksum: 'pending',
        status: 'available',
      };
      console.log('Adding artifact:', newArtifact);
    },
    []
  );

  // ─── KPI Metrics ────────────────────────────────────────────────
  const totalModels = models.length;
  const activeDeployments = deployments.filter(
    (d) => d.status === 'Running'
  ).length;
  const totalArtifacts = artifacts.length;

  // ─── Chart Data: Models by Inference Backend ─────────────────────
  const backendData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    models.forEach((m) => {
      m.libraries.forEach((lib) => {
        counts[lib] = (counts[lib] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([label, value], id) => ({
      id,
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      color:
        inferenceBackendColorMap[
          label as keyof typeof inferenceBackendColorMap
        ] || '#9E9E9E',
    }));
  }, [models]);

  // ─── Chart Data: Deployment Status Distribution ──────────────────
  const deploymentStatusDistribution = React.useMemo(() => {
    const counts: Partial<Record<Deployment['status'], number>> = {};
    deployments.forEach((d) => {
      counts[d.status] = (counts[d.status] || 0) + 1;
    });
    return counts;
  }, [deployments]);

  // ─── Recent Models ─────────────────────────────────────────────
  const recentModels = React.useMemo(
    () =>
      [...models]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [models]
  );

  // ─── Recent Deployments ─────────────────────────────────────────
  const recentDeployments = React.useMemo(
    () =>
      [...deployments]
        .sort(
          (a, b) =>
            new Date(b.deployedAt || 0).getTime() -
            new Date(a.deployedAt || 0).getTime()
        )
        .slice(0, 5),
    [deployments]
  );

  // ─── Status Distribution for progress bars ─────────────────────
  const statusDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    models.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return counts;
  }, [models]);

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 0.5 }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here&apos;s what&apos;s happening with your MLHub today.
        </Typography>
      </Box>

      {/* ─── KPI Stat Cards ─────────────────────────────────── */}
      <KpiStatCards />

      {/* ─── Quick Actions + Charts Row ─────────────────────── */}
      <Grid container spacing={2.5} sx={{ mt: 3, mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickActionsCard
            onRegisterModel={onRegisterModel}
            onNewDeployment={() => setDeploymentOpen(true)}
            onUploadArtifact={() => setArtifactOpen(true)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ModelStatusBreakdown
            totalModels={totalModels}
            statusDistribution={statusDistribution}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FrameworkPieChart
            data={backendData}
            onClick={() => setFrameworkModalOpen(true)}
          />
        </Grid>

        {/* BarChart: Deployment Status — Full Width */}
        <Grid size={{ xs: 12 }}>
          <DeploymentStatusChart
            deployments={deployments}
            distribution={deploymentStatusDistribution}
          />
        </Grid>
      </Grid>

      {/* ─── Recent Models & Deployments ─────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <RecentModelsList models={recentModels} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <RecentDeploymentsList deployments={recentDeployments} />
        </Grid>
      </Grid>

      {/* ─── Framework Bar Chart Modal ────────────────────── */}
      <FrameworkBarChartModal
        open={frameworkModalOpen}
        onClose={() => setFrameworkModalOpen(false)}
        data={backendData}
      />

      {/* ─── New Deployment Dialog (from Quick Actions) ─── */}
      <DeploymentDialog
        open={deploymentOpen}
        onClose={() => setDeploymentOpen(false)}
        author={username}
      />

      {/* ─── Upload Artifact Dialog (from Quick Actions) ── */}
      <ArtifactDialog
        open={artifactOpen}
        onClose={() => setArtifactOpen(false)}
        onSave={handleSaveArtifact}
        models={models}
        datasets={datasets}
      />
    </Box>
  );
}
