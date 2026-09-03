import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  Paper,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LayersIcon from '@mui/icons-material/Layers';
import StreamIcon from '@mui/icons-material/Stream';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ExtensionIcon from '@mui/icons-material/Extension';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import {
  AgentRecord,
  generateAgentRecordUrn,
  getRecordInterfaces,
} from '../types/agent';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { agentControlPlaneColors } from './uiTokens';

interface AgentRecordsPageProps {
  records?: AgentRecord[];
  onInstantiateRecord: (record: AgentRecord) => void;
  onOpenCreateRecord: () => void;
  onSelectRecord: (record: AgentRecord) => void;
}

const cardSectionGap = 1.5;

export const AgentRecordsPage: React.FC<AgentRecordsPageProps> = ({
  records: propRecords,
  onInstantiateRecord,
  onOpenCreateRecord,
  onSelectRecord,
}) => {
  const { records: hookRecords } = useListAgentRecords();
  const records = propRecords ?? hookRecords;
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrn, setCopiedUrn] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !(current[sectionId] ?? true),
    }));
  };

  const handleCopyUrn = (record: AgentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const urn = generateAgentRecordUrn(record.tenant_id, record.id);
    navigator.clipboard.writeText(urn);
    setCopiedUrn(record.id);
    setTimeout(() => setCopiedUrn(null), 2000);
  };

  const filteredRecords = records.filter((r) => {
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skills.some(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.includes(searchQuery.toLowerCase())
      ) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'DockerImage':
        return '🐳';
      case 'HelmChart':
        return '☸️';
      case 'PythonPackage':
        return '🐍';
      case 'Binary':
        return '⚙️';
      case 'SourceCode':
        return '📦';
      default:
        return '📄';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Top Banner & Action */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
              >
                Agent Records Catalog (Blueprints)
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.25 }}
              >
                Reusable, versioned agent specifications defining standard
                interfaces, required skills, and artifact locators
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenCreateRecord}
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                Create Agent Record
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Search bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search records by name, semantic version, skills, or artifact tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: 'text.secondary', fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Grid of Agent Record Blueprints */}
      <Grid container spacing={3}>
        {filteredRecords.map((record) => {
          const urn = generateAgentRecordUrn(record.tenant_id, record.id);
          const interfaces = getRecordInterfaces(record);
          const capabilityCount =
            Number(record.capabilities.streaming) +
            Number(record.capabilities.push_notifications);
          const skillsSectionId = `${record.id}-skills`;
          const capabilitiesSectionId = `${record.id}-capabilities`;
          const artifactsSectionId = `${record.id}-artifacts`;
          const skillsExpanded = expandedSections[skillsSectionId] ?? true;
          const capabilitiesExpanded =
            expandedSections[capabilitiesSectionId] ?? true;
          const artifactsExpanded =
            expandedSections[artifactsSectionId] ?? true;

          return (
            <Grid size={{ xs: 12, md: 6 }} key={record.id}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Card Header: Icon, Name, Version, Visibility */}
                  <Box
                    component="header"
                    sx={{
                      borderBottom: `1px solid ${agentControlPlaneColors.border}`,
                      mb: 2,
                      mx: -3,
                      px: 3,
                      pb: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <Avatar
                        variant="rounded"
                        src={record.icon_url || undefined}
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          fontWeight: 700,
                          color: '#ffffff',
                        }}
                      >
                        {record.name.slice(0, 2).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: agentControlPlaneColors.strongText,
                              cursor: 'pointer',
                              '&:hover': { color: 'primary.main' },
                            }}
                            onClick={() => onSelectRecord(record)}
                          >
                            {record.name}
                          </Typography>
                          <Chip
                            label={`v${record.version}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(6, 182, 212, 0.15)',
                              color: '#22d3ee',
                              fontWeight: 600,
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '0.725rem',
                              height: 22,
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            mt: 0.25,
                          }}
                        >
                          Owned by{' '}
                          <Box
                            component="span"
                            sx={{
                              color: agentControlPlaneColors.strongText,
                              fontWeight: 700,
                            }}
                          >
                            {record.owner}
                          </Box>
                          {record.provider &&
                            ` • ${record.provider.organization}`}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            icon={
                              record.visibility === 'Public' ? (
                                <PublicIcon sx={{ fontSize: 13 }} />
                              ) : (
                                <PublicOffIcon sx={{ fontSize: 13 }} />
                              )
                            }
                            label={record.visibility}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor:
                                record.visibility === 'Public'
                                  ? 'rgba(16, 185, 129, 0.4)'
                                  : agentControlPlaneColors.border,
                              color:
                                record.visibility === 'Public'
                                  ? '#34d399'
                                  : 'text.secondary',
                              fontSize: '0.675rem',
                              height: 20,
                            }}
                          />
                          <Chip
                            icon={
                              <LayersIcon
                                sx={{
                                  fontSize: '13px !important',
                                  color: '#818cf8 !important',
                                }}
                              />
                            }
                            label={`${interfaces.length} Interfaces`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              color: '#818cf8',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2.5,
                      lineHeight: 1.5,
                      minHeight: 44,
                    }}
                  >
                    {record.description}
                  </Typography>

                  {/* Blueprint URN */}
                  <Box
                    sx={{
                      bgcolor: agentControlPlaneColors.mutedSurface,
                      p: 1,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        color: 'text.secondary',
                        fontSize: '0.675rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '88%',
                      }}
                    >
                      {urn}
                    </Typography>
                    <Tooltip
                      title={
                        copiedUrn === record.id
                          ? 'Copied!'
                          : 'Copy Blueprint URN'
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyUrn(record, e)}
                      >
                        <ContentCopyIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Stack spacing={1.25}>
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <InputIcon
                          sx={{ fontSize: 16, color: 'primary.light' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '0.04em',
                          }}
                        >
                          DEFAULT INPUT MODES
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                      >
                        {record.default_input_modes.map((mode) => (
                          <Chip
                            key={mode}
                            label={mode}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.675rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <OutputIcon
                          sx={{ fontSize: 16, color: 'primary.light' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '0.04em',
                          }}
                        >
                          DEFAULT OUTPUT MODES
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                      >
                        {record.default_output_modes.map((mode) => (
                          <Chip
                            key={mode}
                            label={mode}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.675rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: cardSectionGap }} />

                  {/* Skills Section */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        mb: skillsExpanded ? 0.75 : 0,
                      }}
                    >
                      <ExtensionIcon
                        sx={{ fontSize: 16, color: 'primary.light' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          letterSpacing: '0.04em',
                        }}
                      >
                        SKILLS ({record.skills.length})
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => toggleSection(skillsSectionId)}
                        aria-label={
                          skillsExpanded ? 'Collapse skills' : 'Expand skills'
                        }
                      >
                        {skillsExpanded ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>

                    <Collapse in={skillsExpanded}>
                      <Stack spacing={1}>
                        {record.skills.map((skill) => (
                          <Paper
                            key={skill.id}
                            variant="outlined"
                            sx={{
                              p: 1,
                              bgcolor: agentControlPlaneColors.surface,
                              borderColor: agentControlPlaneColors.border,
                              borderRadius: 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: 'center' }}
                            >
                              <Chip
                                label={skill.id}
                                size="small"
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: '0.675rem',
                                  bgcolor: 'rgba(99, 102, 241, 0.12)',
                                  color: 'primary.light',
                                  height: 18,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                              >
                                {skill.name}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              {skill.description}
                            </Typography>
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              {skill.input_modes?.length ? (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    Input:
                                  </Typography>
                                  {skill.input_modes.map((mode) => (
                                    <Chip
                                      key={mode}
                                      label={mode}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.65rem', height: 19 }}
                                    />
                                  ))}
                                </Stack>
                              ) : null}
                              {skill.output_modes?.length ? (
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    Output:
                                  </Typography>
                                  {skill.output_modes.map((mode) => (
                                    <Chip
                                      key={mode}
                                      label={mode}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.65rem', height: 19 }}
                                    />
                                  ))}
                                </Stack>
                              ) : null}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>

                  <Divider sx={{ my: cardSectionGap }} />

                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        mb: capabilitiesExpanded ? 0.75 : 0,
                      }}
                    >
                      <StreamIcon
                        sx={{ fontSize: 16, color: 'primary.light' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          letterSpacing: '0.04em',
                        }}
                      >
                        CAPABILITIES ({capabilityCount})
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => toggleSection(capabilitiesSectionId)}
                        aria-label={
                          capabilitiesExpanded
                            ? 'Collapse capabilities'
                            : 'Expand capabilities'
                        }
                      >
                        {capabilitiesExpanded ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>
                    <Collapse in={capabilitiesExpanded}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', gap: 0.75 }}
                      >
                        {record.capabilities.streaming && (
                          <Chip
                            icon={
                              <StreamIcon
                                sx={{
                                  fontSize: '13px !important',
                                  color: '#10b981 !important',
                                }}
                              />
                            }
                            label="Streaming Supported"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              color: '#34d399',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                        {record.capabilities.push_notifications && (
                          <Chip
                            icon={
                              <NotificationsActiveIcon
                                sx={{
                                  fontSize: '13px !important',
                                  color: '#38bdf8 !important',
                                }}
                              />
                            }
                            label="Push / Webhooks"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(56, 189, 248, 0.1)',
                              color: '#7dd3fc',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Stack>
                    </Collapse>
                  </Box>

                  <Divider sx={{ my: cardSectionGap }} />

                  {/* Artifact Locators */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: 'center',
                        mb: artifactsExpanded ? 0.75 : 0,
                      }}
                    >
                      <Inventory2Icon
                        sx={{ fontSize: 16, color: 'primary.light' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          letterSpacing: '0.04em',
                        }}
                      >
                        ARTIFACT LOCATORS ({record.artifact_locators.length})
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => toggleSection(artifactsSectionId)}
                        aria-label={
                          artifactsExpanded
                            ? 'Collapse artifact locators'
                            : 'Expand artifact locators'
                        }
                      >
                        {artifactsExpanded ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>
                    <Collapse in={artifactsExpanded}>
                      <Stack spacing={0.75}>
                        {record.artifact_locators.map((art, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 0.75,
                              borderRadius: 1,
                              bgcolor: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.04)',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.9rem' }}>
                              {getArtifactIcon(art.artifact_type)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.primary', fontWeight: 500 }}
                            >
                              {art.artifact_type}:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '0.7rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {art.url}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Collapse>
                  </Box>

                  <Divider sx={{ mt: cardSectionGap }} />
                </CardContent>

                {/* Bottom Action Footer */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderTop: `1px solid ${agentControlPlaneColors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {record.documentation_url ? (
                    <Button
                      size="small"
                      startIcon={<DescriptionIcon sx={{ fontSize: 15 }} />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                      href={record.documentation_url}
                      target="_blank"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Docs
                    </Button>
                  ) : (
                    <Box />
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<RocketLaunchIcon sx={{ fontSize: 15 }} />}
                    onClick={() => onInstantiateRecord(record)}
                    sx={{
                      bgcolor: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2,
                    }}
                  >
                    Deploy Instance
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AgentRecordsPage;
