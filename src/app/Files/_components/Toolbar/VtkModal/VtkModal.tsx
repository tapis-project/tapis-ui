import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { GenericModal } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useFilesSelect } from '../../FilesContext';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Info, Visibility, VisibilityOff } from '@mui/icons-material';
import VtkPane, { PaneHandle, PaneState } from './VtkPane';
import type { MutableRefObject } from 'react';

const VtkModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, isError, error } = Hooks.PostIts.useCreate();

  const fileName = selectedFiles[0]?.name ?? '';
  const fileExt = fileName.split('.').pop()?.toLowerCase() ?? '';
  const fileTooLarge = (selectedFiles[0]?.size ?? 0) > 25 * 1024 * 1024;

  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | undefined>(undefined);
  const [panes, setPanes] = useState<number[]>([0]);
  const nextId = useRef(1);
  const blobUrlRef = useRef<string | undefined>(undefined);

  // ── Active pane tracking ─────────────────────────────────────────────────
  const [activePaneId, setActivePaneId] = useState(0);
  const activePaneIdRef = useRef(0);
  activePaneIdRef.current = activePaneId; // always current, safe in callbacks

  const [activePaneState, setActivePaneState] = useState<PaneState | null>(
    null
  );
  const allPaneStatesRef = useRef<Record<number, PaneState>>({});
  const paneRefsMapRef = useRef<
    Map<number, MutableRefObject<PaneHandle | null>>
  >(new Map());

  // Local mirror of normalInput — avoids cursor jump from async state round-trip
  const [localNormalInput, setLocalNormalInput] = useState({
    x: '0',
    y: '0',
    z: '1',
  });
  useEffect(() => {
    const pni = activePaneState?.normalInput;
    if (!pni) return;
    // Only update if values actually differ to avoid triggering extra re-renders
    setLocalNormalInput((prev) =>
      prev.x === pni.x && prev.y === pni.y && prev.z === pni.z ? prev : pni
    );
  }, [
    activePaneState?.normalInput?.x,
    activePaneState?.normalInput?.y,
    activePaneState?.normalInput?.z,
  ]);

  // Info popover anchor
  const [infoAnchor, setInfoAnchor] = useState<HTMLButtonElement | null>(null);

  // ── Fetch file once via PostIt → shared blob URL ─────────────────────────
  useEffect(() => {
    if (fileTooLarge) return;
    create(
      {
        systemId,
        path: selectedFiles[0].path!,
        createPostItRequest: { allowedUses: 1, validSeconds: 300 },
      },
      {
        onSuccess: async (value) => {
          const redeemUrl = value.result?.redeemUrl;
          if (!redeemUrl) return;
          try {
            const resp = await fetch(redeemUrl);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            blobUrlRef.current = url;
            setBlobUrl(url);
          } catch (e: any) {
            setFetchError(e.message);
          }
        },
      }
    );
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = undefined;
      }
    };
  }, [systemId, path]);

  // ── Pane handle refs ─────────────────────────────────────────────────────
  const getOrCreateHandleRef = (
    id: number
  ): MutableRefObject<PaneHandle | null> => {
    if (!paneRefsMapRef.current.has(id)) {
      paneRefsMapRef.current.set(id, { current: null });
    }
    return paneRefsMapRef.current.get(id)!;
  };

  // Returns the active pane's imperative handle (null if not mounted yet)
  const activeRef = () =>
    paneRefsMapRef.current.get(activePaneId)?.current ?? null;

  // ── State / activation callbacks ─────────────────────────────────────────
  const handleStateChange = (id: number, state: PaneState) => {
    allPaneStatesRef.current[id] = state;
    if (id === activePaneIdRef.current) setActivePaneState(state);
  };

  const handleActivate = (id: number) => {
    if (id === activePaneIdRef.current) return;
    setActivePaneId(id);
    const known = allPaneStatesRef.current[id];
    if (known) {
      setActivePaneState(known);
      setLocalNormalInput(known.normalInput);
    }
  };

  // ── Pane management ──────────────────────────────────────────────────────
  const addPane = () => {
    if (panes.length >= 4) return;
    setPanes((p) => [...p, nextId.current++]);
  };

  const removePane = (id: number) => {
    const remaining = panes.filter((x) => x !== id);
    setPanes(remaining);
    paneRefsMapRef.current.delete(id);
    delete allPaneStatesRef.current[id];
    if (id === activePaneId && remaining.length > 0) {
      setActivePaneId(remaining[0]);
      const known = allPaneStatesRef.current[remaining[0]];
      if (known) {
        setActivePaneState(known);
        setLocalNormalInput(known.normalInput);
      }
    }
  };

  const gridCols = panes.length === 1 ? '1fr' : '1fr 1fr';
  const gridRows = panes.length <= 2 ? '1fr' : '1fr 1fr';
  const ps = activePaneState;
  const loaded = !!ps?.renderKind;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <GenericModal
      size="xl"
      toggle={() => {
        if (document.fullscreenElement) document.exitFullscreen();
        toggle();
        unselect(selectedFiles);
      }}
      title={`VTK Viewer — ${fileName}`}
      body={
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          {fileTooLarge && (
            <Alert severity="error">
              <AlertTitle>File Too Large</AlertTitle>
              This file exceeds the 25 MB limit. Size:{' '}
              {(selectedFiles[0].size! / (1024 * 1024)).toFixed(1)} MB
            </Alert>
          )}
          {isError && error && (
            <Alert severity="error">
              <AlertTitle>Error loading file</AlertTitle>
              {error.message}
            </Alert>
          )}
          {fetchError && (
            <Alert severity="error">
              <AlertTitle>Error fetching file</AlertTitle>
              {fetchError}
            </Alert>
          )}

          {!fileTooLarge && (
            <>
              {/* ── Shared controls bar ─────────────────────────────────── */}
              <Box
                sx={{
                  flexShrink: 0,
                  borderBottom: '1px solid #333',
                  px: 1.5,
                  py: 1,
                }}
              >
                {!loaded ? (
                  <Typography variant="caption" color="text.secondary">
                    {blobUrl
                      ? panes.length > 1
                        ? 'Click a pane to focus it and see controls'
                        : 'Loading visualization…'
                      : 'Loading file…'}
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    {/* Main controls row */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      flexWrap="wrap"
                    >
                      {/* Property / array selector */}
                      {ps!.availableArrays.length > 1 && (
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <InputLabel sx={{ fontSize: 12 }}>
                            Property
                          </InputLabel>
                          <Select
                            value={ps!.selectedArray}
                            label="Property"
                            sx={{ fontSize: 12 }}
                            onChange={(e) =>
                              activeRef()?.changeArray(e.target.value)
                            }
                          >
                            {ps!.availableArrays.map((name) => (
                              <MenuItem
                                key={name}
                                value={name}
                                sx={{ fontSize: 12 }}
                              >
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {/* Threshold slider */}
                      <Box sx={{ minWidth: 150 }}>
                        <Typography variant="caption" color="text.secondary">
                          Threshold
                        </Typography>
                        <Slider
                          size="small"
                          value={ps!.thresholdRange}
                          min={ps!.dataRange[0]}
                          max={ps!.dataRange[1]}
                          step={
                            (ps!.dataRange[1] - ps!.dataRange[0]) / 200 || 0.01
                          }
                          valueLabelDisplay="auto"
                          onChange={(_, v) =>
                            activeRef()?.changeThreshold(v as [number, number])
                          }
                          sx={{ py: 0.5 }}
                        />
                      </Box>

                      {/* Colorbar */}
                      {ps!.hasColorbar && (
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={ps!.showColorbar}
                              onChange={() => activeRef()?.toggleColorbar()}
                            />
                          }
                          label={
                            <Typography variant="caption">Colorbar</Typography>
                          }
                          labelPlacement="end"
                          sx={{ m: 0 }}
                        />
                      )}

                      {/* Mesh */}
                      {ps!.hasMesh && (
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={ps!.showMesh}
                              onChange={() => activeRef()?.toggleMesh()}
                            />
                          }
                          label={
                            <Typography variant="caption">Mesh</Typography>
                          }
                          labelPlacement="end"
                          sx={{ m: 0 }}
                        />
                      )}

                      {/* Eye — hide/show data */}
                      <Tooltip
                        title={ps!.dataVisible ? 'Hide data' : 'Show data'}
                      >
                        <IconButton
                          size="small"
                          onClick={() => activeRef()?.toggleData()}
                        >
                          {ps!.dataVisible ? (
                            <Visibility fontSize="small" />
                          ) : (
                            <VisibilityOff fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      {/* Slice toggle */}
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={ps!.sliceEnabled}
                            onChange={() => activeRef()?.toggleSlice()}
                          />
                        }
                        label={<Typography variant="caption">Slice</Typography>}
                        labelPlacement="end"
                        sx={{ m: 0 }}
                      />

                      {/* Info popover */}
                      {ps!.dataInfo && (
                        <Tooltip title="Dataset info">
                          <IconButton
                            size="small"
                            onClick={(e) => setInfoAnchor(e.currentTarget)}
                          >
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>

                    {/* Slice orientation panel */}
                    {ps!.sliceEnabled && (
                      <>
                        <Divider />
                        <Stack spacing={0.75}>
                          <Stack
                            direction="row"
                            alignItems="flex-start"
                            spacing={2}
                            flexWrap="wrap"
                          >
                            {/* Preset buttons */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Preset:
                              </Typography>
                              {(['X', 'Y', 'Z'] as const).map((p) => (
                                <Button
                                  key={p}
                                  size="small"
                                  variant="outlined"
                                  sx={{ minWidth: 32, px: 0.5, py: 0.25 }}
                                  onClick={() => activeRef()?.applyPreset(p)}
                                >
                                  {p}
                                </Button>
                              ))}
                            </Stack>

                            {/* Azimuth */}
                            <Box sx={{ minWidth: 130 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Azimuth: {ps!.azimuth.toFixed(0)}°
                              </Typography>
                              <Slider
                                size="small"
                                min={0}
                                max={360}
                                value={ps!.azimuth}
                                onChange={(_, v) =>
                                  activeRef()?.changeAzimuth(v as number)
                                }
                                sx={{ py: 0.5 }}
                              />
                            </Box>

                            {/* Elevation */}
                            <Box sx={{ minWidth: 130 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Elevation: {ps!.elevation.toFixed(0)}°
                              </Typography>
                              <Slider
                                size="small"
                                min={-90}
                                max={90}
                                value={ps!.elevation}
                                onChange={(_, v) =>
                                  activeRef()?.changeElevation(v as number)
                                }
                                sx={{ py: 0.5 }}
                              />
                            </Box>

                            {/* Position */}
                            <Box sx={{ minWidth: 130 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Position: {ps!.sliceOffset.toFixed(2)}
                              </Typography>
                              <Slider
                                size="small"
                                min={ps!.posRange[0]}
                                max={ps!.posRange[1]}
                                step={
                                  (ps!.posRange[1] - ps!.posRange[0]) / 200 ||
                                  0.01
                                }
                                value={ps!.sliceOffset}
                                onChange={(_, v) =>
                                  activeRef()?.changeOffset(v as number)
                                }
                                sx={{ py: 0.5 }}
                              />
                            </Box>
                          </Stack>

                          {/* Normal vector text inputs */}
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Normal:
                            </Typography>
                            {(['x', 'y', 'z'] as const).map((axis) => (
                              <TextField
                                key={axis}
                                size="small"
                                label={axis.toUpperCase()}
                                value={localNormalInput[axis]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLocalNormalInput((prev) => ({
                                    ...prev,
                                    [axis]: val,
                                  }));
                                  activeRef()?.setNormalField(axis, val);
                                }}
                                onBlur={() => activeRef()?.applyNormal()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    activeRef()?.applyNormal();
                                }}
                                inputProps={{
                                  style: {
                                    width: 60,
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                  },
                                }}
                                sx={{ width: 85 }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </>
                    )}
                  </Stack>
                )}
              </Box>

              {/* ── Pane area (fills remaining height) ──────────────────── */}
              <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Loading spinner */}
                {!blobUrl && !fetchError && !isError && (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%' }}
                    spacing={1}
                  >
                    <CircularProgress size={32} />
                    <Typography variant="caption" color="text.secondary">
                      Loading file…
                    </Typography>
                  </Stack>
                )}

                {/* Pane grid */}
                {blobUrl && (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      gridTemplateRows: gridRows,
                      gap: 0.5,
                      p: 0.5,
                      boxSizing: 'border-box',
                    }}
                  >
                    {panes.map((id) => (
                      <VtkPane
                        key={id}
                        handleRef={getOrCreateHandleRef(id)}
                        blobUrl={blobUrl}
                        fileName={fileName}
                        fileExt={fileExt}
                        isActive={id === activePaneId}
                        canAddView={panes.length < 4}
                        onActivate={() => handleActivate(id)}
                        onAddView={addPane}
                        onClose={
                          panes.length > 1 ? () => removePane(id) : undefined
                        }
                        onStateChange={(state) => handleStateChange(id, state)}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* ── Info popover ─────────────────────────────────────────── */}
              <Popover
                open={!!infoAnchor}
                anchorEl={infoAnchor}
                onClose={() => setInfoAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                {ps?.dataInfo && (
                  <Box sx={{ p: 1.5, maxWidth: 320 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      display="block"
                    >
                      {ps.dataInfo.type === 'volume' ? 'Volume' : 'Surface'}{' '}
                      Dataset
                    </Typography>
                    <Typography variant="caption" display="block">
                      Points: {ps.dataInfo.numPoints.toLocaleString()}
                    </Typography>
                    {ps.dataInfo.numCells != null && (
                      <Typography variant="caption" display="block">
                        Cells: {ps.dataInfo.numCells.toLocaleString()}
                      </Typography>
                    )}
                    {ps.dataInfo.dimensions && (
                      <Typography variant="caption" display="block">
                        Dimensions: {ps.dataInfo.dimensions.join(' × ')}
                      </Typography>
                    )}
                    {ps.dataInfo.spacing && (
                      <Typography variant="caption" display="block">
                        Spacing:{' '}
                        {ps.dataInfo.spacing
                          .map((v) => v.toFixed(4))
                          .join(', ')}
                      </Typography>
                    )}
                    {ps.dataInfo.arrays.length > 0 && (
                      <>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          display="block"
                          sx={{ mt: 0.75 }}
                        >
                          Arrays:
                        </Typography>
                        {ps.dataInfo.arrays.map(({ name, range }) => (
                          <Typography
                            key={name}
                            variant="caption"
                            display="block"
                            sx={{ pl: 1 }}
                          >
                            {name}: [{range[0].toFixed(3)},{' '}
                            {range[1].toFixed(3)}]
                          </Typography>
                        ))}
                      </>
                    )}
                  </Box>
                )}
              </Popover>
            </>
          )}
        </Box>
      }
    />
  );
};

export default VtkModal;
