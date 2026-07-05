import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  alpha,
  Button,
  Grid,
  Tooltip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DatasetIcon from '@mui/icons-material/Dataset';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import StorageIcon from '@mui/icons-material/Storage';
import TableRowsIcon from '@mui/icons-material/TableRows';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import type { Dataset, DatasetArtifact } from '../../types';

// Shared
import {
  datasetStatusColorMap,
  datasetFormatIconMap,
  datasetFormatLabelMap,
} from '../../_components/constants';
import MetaItem from '../../_components/MetaItem';
import DatasetArtifactDialog from './_components/DatasetArtifactDialog';

interface DatasetDetailsPageProps {
  datasets: Dataset[];
  datasetArtifacts: DatasetArtifact[];
  onEdit: (dataset: Dataset) => void;
  onDelete: (id: string) => void;
}

export default function DatasetDetailsPage({
  datasets,
  datasetArtifacts,
  onEdit,
  onDelete,
}: DatasetDetailsPageProps) {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();

  const dataset = datasets.find((d) => d.id === datasetId);

  if (!dataset) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          Dataset not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The dataset you&apos;re looking for does not exist or has been
          removed.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/datasets')}
          variant="contained"
        >
          Back to Datasets
        </Button>
      </Box>
    );
  }

  const relatedArtifacts = datasetArtifacts.filter(
    (a) => a.datasetId === dataset.id
  );

  /* Helpers */
  const artChipColor = (
    s: DatasetArtifact['status']
  ): 'success' | 'error' | 'warning' | 'default' =>
    s === 'available'
      ? 'success'
      : s === 'uploading'
      ? 'warning'
      : s === 'error'
      ? 'error'
      : 'default';

  const datasetIdSx = {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    bgcolor: 'grey.100',
    px: 0.75,
    py: 0.2,
    borderRadius: 1,
    color: 'text.secondary',
  };

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/datasets')}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Datasets
          </Button>
          <Typography variant="body2" color="text.disabled">
            /
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Dataset Details
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Inspect dataset metadata, row counts, storage artifacts, and
          classification details.
        </Typography>
      </Box>

      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2.5,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: (t) => alpha(t.palette.secondary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <DatasetIcon sx={{ fontSize: 34, color: 'secondary.main' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, width: 200 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {dataset.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.25, flexWrap: 'wrap' }}
            >
              <Chip
                label={`v${dataset.version}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />
              <Chip
                label={
                  dataset.status.charAt(0).toUpperCase() +
                  dataset.status.slice(1)
                }
                size="small"
                color={datasetStatusColorMap[dataset.status]}
                sx={{ fontWeight: 500, textTransform: 'capitalize' }}
              />
              <Chip
                icon={<span>{datasetFormatIconMap[dataset.format]}</span>}
                label={datasetFormatLabelMap[dataset.format]}
                size="small"
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Delete this dataset">
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => onDelete(dataset.id)}
                size="small"
              >
                Delete
              </Button>
            </Tooltip>
            <Tooltip title="Edit dataset">
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => onEdit(dataset)}
                size="small"
              >
                Edit Dataset
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Description */}
      <Card
        variant="outlined"
        sx={{ bgcolor: (t) => alpha(t.palette.secondary.main, 0.03), mb: 3 }}
      >
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {dataset.description || 'No description provided.'}
          </Typography>
        </CardContent>
      </Card>

      {/* Metrics + Metadata Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Row Count & Size Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent
              sx={{ py: 3, '&:last-child': { pb: 3 }, textAlign: 'center' }}
            >
              <TableRowsIcon
                sx={{
                  fontSize: 40,
                  mb: 1.5,
                  color:
                    dataset.rowCount != null
                      ? 'secondary.main'
                      : 'text.disabled',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Row Count
              </Typography>
              {dataset.rowCount != null ? (
                <>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'secondary.main',
                    }}
                  >
                    {dataset.rowCount.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    ≈ {dataset.size}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="h3"
                    sx={{ color: 'text.disabled', fontWeight: 700 }}
                  >
                    —
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    {dataset.size}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Metadata Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Metadata
              </Typography>
              <Stack spacing={2}>
                <MetaItem
                  icon={<PersonIcon fontSize="inherit" />}
                  label="Author"
                  value={dataset.author}
                />
                <MetaItem
                  icon={<FingerprintIcon fontSize="inherit" />}
                  label="Dataset ID"
                  value={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={datasetIdSx}
                    >
                      {dataset.id}
                    </Typography>
                  }
                />
                <MetaItem
                  icon={<CalendarTodayIcon fontSize="inherit" />}
                  label="Created"
                  value={new Date(dataset.createdAt).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                />
                <MetaItem
                  icon={<UpdateIcon fontSize="inherit" />}
                  label="Last Updated"
                  value={new Date(dataset.updatedAt).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                />
                <MetaItem
                  icon={<StorageIcon fontSize="inherit" />}
                  label="Size"
                  value={dataset.size}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tags */}
      {dataset.tags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 1.5, fontWeight: 600 }}
          >
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {dataset.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="medium"
                color="secondary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Related Artifacts */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 20, color: 'info.main' }} /> Artifacts
          ({relatedArtifacts.length})
        </Typography>
        {relatedArtifacts.length > 0 ? (
          <Card variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              {relatedArtifacts.map((art) => (
                <Box
                  key={art.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: (t) =>
                      `1px solid ${alpha(t.palette.divider, 0.6)}`,
                    ':last-child': { borderBottom: 'none' },
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.75}
                    sx={{ alignItems: 'center' }}
                  >
                    <FolderOpenIcon
                      sx={{ fontSize: 20, color: 'text.secondary' }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: '0.88rem' }}
                      >
                        {art.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {art.storageType.toUpperCase()} · {art.size}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={art.status}
                    size="small"
                    color={artChipColor(art.status)}
                    sx={{
                      textTransform: 'capitalize',
                      fontSize: '0.72rem',
                      height: 26,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        ) : (
          <Card
            variant="outlined"
            sx={{
              py: 5,
              textAlign: 'center',
              bgcolor: (t) => alpha(t.palette.text.secondary, 0.04),
            }}
          >
            <FolderOpenIcon
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body1" color="text.secondary">
              No artifacts registered for this dataset
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
