import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Box,
  Stack,
  Tooltip,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add,
  CameraAlt,
  Close,
  Fullscreen,
  FullscreenExit,
  RestartAlt,
} from '@mui/icons-material';

// ── Exported types ─────────────────────────────────────────────────────────────

export interface DataInfo {
  type: 'surface' | 'volume';
  numPoints: number;
  numCells?: number;
  dimensions?: number[];
  spacing?: number[];
  origin?: number[];
  bounds: number[];
  arrays: { name: string; range: [number, number] }[];
}

export interface PaneState {
  renderKind: 'surface' | 'volume' | null;
  hasColorbar: boolean;
  availableArrays: string[];
  selectedArray: string;
  dataRange: [number, number];
  thresholdRange: [number, number];
  showColorbar: boolean;
  hasMesh: boolean;
  showMesh: boolean;
  dataVisible: boolean;
  sliceEnabled: boolean;
  azimuth: number;
  elevation: number;
  sliceOffset: number;
  posRange: [number, number];
  normalInput: { x: string; y: string; z: string };
  dataInfo: DataInfo | null;
}

export interface PaneHandle {
  changeArray(name: string): void;
  changeThreshold(range: [number, number]): void;
  toggleColorbar(): void;
  toggleMesh(): void;
  toggleData(): void;
  toggleSlice(): void;
  changeAzimuth(value: number): void;
  changeElevation(value: number): void;
  changeOffset(value: number): void;
  applyPreset(preset: 'X' | 'Y' | 'Z'): void;
  setNormalField(axis: 'x' | 'y' | 'z', value: string): void;
  applyNormal(): void;
  reset(): void;
  screenshot(): void;
}

export interface VtkPaneProps {
  blobUrl: string;
  fileName: string;
  fileExt: string;
  isActive?: boolean;
  canAddView?: boolean;
  handleRef?: React.MutableRefObject<PaneHandle | null>;
  onActivate?: () => void;
  onAddView?: () => void;
  onClose?: () => void;
  onStateChange?: (state: PaneState) => void;
}

// ── Internal types ─────────────────────────────────────────────────────────────

interface SurfaceObjects {
  kind: 'surface';
  renderer: any;
  renderWindow: any;
  actor: any;
  meshActor: any | null;
  mapper: any;
  scalarBar: any;
  hasScalarBar: boolean;
  slicePlane: any;
  slicePlane2: any;
  sliceThickness: number;
  imageBounds: number[];
  imageCenter: [number, number, number];
}

interface VolumeObjects {
  kind: 'volume';
  renderer: any;
  renderWindow: any;
  mapper: any;
  ctf: any;
  ofun: any;
  imageData: any;
  volume: any;
  scalarBar: any;
  hasScalarBar: boolean;
  slicePlane: any;
  sliceMapper: any;
  sliceActor: any;
  imageBounds: number[];
  imageCenter: [number, number, number];
  meshActor: any | null;
  hasMesh: boolean;
}

type VtkObjects = SurfaceObjects | VolumeObjects;

// ── Helpers ────────────────────────────────────────────────────────────────────

const normalFromAngles = (
  azDeg: number,
  elDeg: number
): [number, number, number] => {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  return [
    Math.cos(el) * Math.cos(az),
    Math.cos(el) * Math.sin(az),
    Math.sin(el),
  ];
};

const anglesFromNormal = (nx: number, ny: number, nz: number) => {
  const el = (Math.asin(Math.max(-1, Math.min(1, nz))) * 180) / Math.PI;
  const az = ((Math.atan2(ny, nx) * 180) / Math.PI + 360) % 360;
  return { az, el };
};

const computePosRange = (
  bounds: number[],
  center: [number, number, number],
  normal: [number, number, number]
): [number, number] => {
  const corners: [number, number, number][] = [
    [bounds[0], bounds[2], bounds[4]],
    [bounds[1], bounds[2], bounds[4]],
    [bounds[0], bounds[3], bounds[4]],
    [bounds[1], bounds[3], bounds[4]],
    [bounds[0], bounds[2], bounds[5]],
    [bounds[1], bounds[2], bounds[5]],
    [bounds[0], bounds[3], bounds[5]],
    [bounds[1], bounds[3], bounds[5]],
  ];
  const p = corners.map(
    ([x, y, z]) =>
      (x - center[0]) * normal[0] +
      (y - center[1]) * normal[1] +
      (z - center[2]) * normal[2]
  );
  return [Math.min(...p), Math.max(...p)];
};

const buildVtiOuterSurface = (
  imageData: any
): { pts: Float32Array; cells: Uint32Array } => {
  const [px, py, pz]: [number, number, number] = imageData.getDimensions();
  const [dx, dy, dz]: [number, number, number] = imageData.getSpacing();
  const [ox, oy, oz]: [number, number, number] = imageData.getOrigin();
  const pts: number[] = [],
    cells: number[] = [];
  let ptCount = 0;
  const addFace = (
    i0: number,
    j0: number,
    k0: number,
    di1: number,
    dj1: number,
    dk1: number,
    n1: number,
    di2: number,
    dj2: number,
    dk2: number,
    n2: number
  ) => {
    const base = ptCount;
    for (let b = 0; b <= n2; b++)
      for (let a = 0; a <= n1; a++) {
        pts.push(
          ox + (i0 + a * di1 + b * di2) * dx,
          oy + (j0 + a * dj1 + b * dj2) * dy,
          oz + (k0 + a * dk1 + b * dk2) * dz
        );
        ptCount++;
      }
    for (let b = 0; b < n2; b++)
      for (let a = 0; a < n1; a++) {
        const p = base + b * (n1 + 1) + a;
        cells.push(4, p, p + 1, p + n1 + 2, p + n1 + 1);
      }
  };
  addFace(0, 0, 0, 1, 0, 0, px - 1, 0, 1, 0, py - 1);
  addFace(0, 0, pz - 1, 1, 0, 0, px - 1, 0, 1, 0, py - 1);
  addFace(0, 0, 0, 1, 0, 0, px - 1, 0, 0, 1, pz - 1);
  addFace(0, py - 1, 0, 1, 0, 0, px - 1, 0, 0, 1, pz - 1);
  addFace(0, 0, 0, 0, 1, 0, py - 1, 0, 0, 1, pz - 1);
  addFace(px - 1, 0, 0, 0, 1, 0, py - 1, 0, 0, 1, pz - 1);
  return { pts: Float32Array.from(pts), cells: Uint32Array.from(cells) };
};

// ── VTK pipeline helpers ───────────────────────────────────────────────────────

const setupPolyDataRendering = async (url: string, renderer: any) => {
  const { default: vtkXMLPolyDataReader } = await import(
    '@kitware/vtk.js/IO/XML/XMLPolyDataReader'
  );
  const { default: vtkActor } = await import(
    '@kitware/vtk.js/Rendering/Core/Actor'
  );
  const { default: vtkMapper } = await import(
    '@kitware/vtk.js/Rendering/Core/Mapper'
  );

  const reader = vtkXMLPolyDataReader.newInstance();
  await reader.setUrl(url);
  await reader.loadData();

  const polyData = reader.getOutputData(0);
  const pointData = polyData.getPointData();
  const arrays: string[] = [];
  for (let i = 0; i < pointData.getNumberOfArrays(); i++)
    arrays.push(pointData.getArrayName(i));

  const mapper = vtkMapper.newInstance();
  mapper.setInputData(polyData);

  let range: [number, number] = [0, 1];
  if (arrays.length > 0) {
    const firstArray = pointData.getArrayByIndex(0);
    range = firstArray.getRange() as [number, number];
    mapper.setScalarVisibility(true);
    mapper.setColorByArrayName(arrays[0]);
    mapper.setScalarModeToUsePointFieldData();
    mapper.setScalarRange(range[0], range[1]);
    const lut = mapper.getLookupTable();
    lut.setHueRange(0.667, 0);
    lut.build();
  } else {
    mapper.setScalarVisibility(false);
  }

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  renderer.addActor(actor);

  const meshMapper = vtkMapper.newInstance();
  meshMapper.setInputData(polyData);
  meshMapper.setScalarVisibility(false);
  const meshActor = vtkActor.newInstance();
  meshActor.setMapper(meshMapper);
  meshActor.getProperty().setRepresentationToWireframe();
  meshActor.getProperty().setColor(0.8, 0.8, 0.8);
  meshActor.getProperty().setLineWidth(1);

  const arrayRanges = arrays.map((name) => ({
    name,
    range: (pointData.getArrayByName(name)?.getRange() ?? [0, 1]) as [
      number,
      number
    ],
  }));

  return {
    actor,
    meshActor,
    mapper,
    arrays,
    range,
    bounds: polyData.getBounds() as number[],
    numPoints: polyData.getNumberOfPoints() as number,
    numCells: polyData.getNumberOfCells() as number,
    arrayRanges,
  };
};

const setupVolumeRendering = async (url: string, renderer: any) => {
  const { default: vtkXMLImageDataReader } = await import(
    '@kitware/vtk.js/IO/XML/XMLImageDataReader'
  );
  const { default: vtkVolume } = await import(
    '@kitware/vtk.js/Rendering/Core/Volume'
  );
  const { default: vtkVolumeMapper } = await import(
    '@kitware/vtk.js/Rendering/Core/VolumeMapper'
  );
  const { default: vtkColorTransferFunction } = await import(
    '@kitware/vtk.js/Rendering/Core/ColorTransferFunction'
  );
  const { default: vtkPiecewiseFunction } = await import(
    '@kitware/vtk.js/Common/DataModel/PiecewiseFunction'
  );

  const reader = vtkXMLImageDataReader.newInstance();
  await reader.setUrl(url);
  await reader.loadData();

  const imageData = reader.getOutputData(0);
  const pointData = imageData.getPointData();
  const arrays: string[] = [];
  for (let i = 0; i < pointData.getNumberOfArrays(); i++)
    arrays.push(pointData.getArrayName(i));

  const activeScalars = pointData.getScalars();
  const range = activeScalars.getRange() as [number, number];

  const ctf = vtkColorTransferFunction.newInstance();
  ctf.addRGBPoint(range[0], 0.23, 0.3, 0.75);
  ctf.addRGBPoint((range[0] + range[1]) / 2, 0.86, 0.86, 0.86);
  ctf.addRGBPoint(range[1], 0.71, 0.12, 0.11);

  const ofun = vtkPiecewiseFunction.newInstance();
  ofun.addPoint(range[0], 0.0);
  ofun.addPoint(range[1], 1.0);

  const mapper = vtkVolumeMapper.newInstance();
  mapper.setInputData(imageData);

  const volume = vtkVolume.newInstance();
  volume.setMapper(mapper);
  volume.getProperty().setRGBTransferFunction(0, ctf);
  volume.getProperty().setScalarOpacity(0, ofun);
  renderer.addVolume(volume);

  const arrayRanges = arrays.map((name) => ({
    name,
    range: (imageData.getPointData().getArrayByName(name)?.getRange() ?? [
      0, 1,
    ]) as [number, number],
  }));

  return { mapper, ctf, ofun, imageData, arrays, range, volume, arrayRanges };
};

// ── Component ──────────────────────────────────────────────────────────────────

const overlayBtnSx = {
  color: 'white',
  bgcolor: 'rgba(0,0,0,0.45)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
} as const;

const VtkPane: React.FC<VtkPaneProps> = ({
  blobUrl,
  fileName,
  fileExt,
  isActive,
  canAddView,
  handleRef,
  onActivate,
  onAddView,
  onClose,
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vtkRef = useRef<VtkObjects | null>(null);
  const grwRef = useRef<any>(null);
  const initialRef = useRef<{
    array: string;
    range: [number, number];
  } | null>(null);
  const initialCameraRef = useRef<{
    position: [number, number, number];
    focalPoint: [number, number, number];
    viewUp: [number, number, number];
  } | null>(null);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const [renderError, setRenderError] = useState<string | undefined>(undefined);
  const [availableArrays, setAvailableArrays] = useState<string[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('');
  const [dataRange, setDataRange] = useState<[number, number]>([0, 1]);
  const [thresholdRange, setThresholdRange] = useState<[number, number]>([
    0, 1,
  ]);
  const [showColorbar, setShowColorbar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderKind, setRenderKind] = useState<'surface' | 'volume' | null>(
    null
  );
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);
  const [hasMesh, setHasMesh] = useState(false);
  const [dataVisible, setDataVisible] = useState(true);
  const [sliceEnabled, setSliceEnabled] = useState(false);
  const [showMesh, setShowMesh] = useState(false);
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(90);
  const [sliceOffset, setSliceOffset] = useState(0);
  const [posRange, setPosRange] = useState<[number, number]>([-1, 1]);
  const [normalInput, setNormalInput] = useState({ x: '0', y: '0', z: '1' });

  // Propagate state to VtkModal whenever anything changes
  useEffect(() => {
    onStateChangeRef.current?.({
      renderKind,
      hasColorbar: vtkRef.current?.hasScalarBar ?? false,
      availableArrays,
      selectedArray,
      dataRange,
      thresholdRange,
      showColorbar,
      hasMesh,
      showMesh,
      dataVisible,
      sliceEnabled,
      azimuth,
      elevation,
      sliceOffset,
      posRange,
      normalInput,
      dataInfo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    renderKind,
    availableArrays,
    selectedArray,
    dataRange,
    thresholdRange,
    showColorbar,
    hasMesh,
    showMesh,
    dataVisible,
    sliceEnabled,
    azimuth,
    elevation,
    sliceOffset,
    posRange,
    normalInput,
    dataInfo,
  ]);

  // ── VTK init ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!blobUrl || !containerRef.current) return;
    let grw: any, orientationWidget: any;
    let mounted = true;

    Promise.all([
      import('@kitware/vtk.js/Rendering/Profiles/Geometry'),
      import('@kitware/vtk.js/Rendering/Profiles/Volume'),
      import('@kitware/vtk.js/Rendering/Misc/GenericRenderWindow'),
      import('@kitware/vtk.js/Rendering/Core/ScalarBarActor'),
      import('@kitware/vtk.js/Rendering/Core/AxesActor'),
      import('@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget'),
    ])
      .then(async ([, , grwMod, sbMod, axesMod, owMod]) => {
        if (!mounted) return;
        grw = grwMod.default.newInstance({ background: [0.1, 0.1, 0.1] });
        grw.setContainer(containerRef.current);
        grw.resize();
        grwRef.current = grw;

        const renderer = grw.getRenderer();
        const renderWindow = grw.getRenderWindow();

        // Standard convention: X=red, Y=green, Z=blue
        const axes = axesMod.default.newInstance();
        axes.setYAxisColor([0, 220, 0]);
        axes.setZAxisColor([30, 100, 255]);
        orientationWidget = owMod.default.newInstance({
          actor: axes,
          interactor: renderWindow.getInteractor(),
        });
        orientationWidget.setEnabled(true);
        orientationWidget.setViewportCorner(owMod.default.Corners.BOTTOM_LEFT);
        orientationWidget.setViewportSize(0.15);
        orientationWidget.setMinPixelSize(80);
        orientationWidget.setMaxPixelSize(200);

        if (fileExt === 'vti') {
          const {
            mapper,
            ctf,
            ofun,
            imageData,
            arrays,
            range,
            volume,
            arrayRanges,
          } = await setupVolumeRendering(blobUrl, renderer);

          const scalarBar = sbMod.default.newInstance();
          scalarBar.setScalarsToColors(ctf);
          renderer.addActor(scalarBar);
          setShowColorbar(true);

          const { default: vtkImageResliceMapper } = await import(
            '@kitware/vtk.js/Rendering/Core/ImageResliceMapper'
          );
          const { default: vtkImageSlice } = await import(
            '@kitware/vtk.js/Rendering/Core/ImageSlice'
          );
          const { default: vtkPlane } = await import(
            '@kitware/vtk.js/Common/DataModel/Plane'
          );

          const bounds = imageData.getBounds();
          const imageCenter: [number, number, number] = [
            (bounds[0] + bounds[1]) / 2,
            (bounds[2] + bounds[3]) / 2,
            (bounds[4] + bounds[5]) / 2,
          ];
          const initNormal = normalFromAngles(0, 90);
          const initPosRange = computePosRange(bounds, imageCenter, initNormal);

          const slicePlane = vtkPlane.newInstance();
          slicePlane.setNormal(...initNormal);
          slicePlane.setOrigin(...imageCenter);

          const sliceMapper = vtkImageResliceMapper.newInstance();
          sliceMapper.setInputData(imageData);
          sliceMapper.setSlicePlane(slicePlane);

          const sliceActor = vtkImageSlice.newInstance();
          sliceActor.setMapper(sliceMapper);
          sliceActor.getProperty().setRGBTransferFunction(ctf);
          sliceActor.getProperty().setUseLookupTableScalarRange(true);

          const numCells = imageData.getNumberOfCells() as number;
          const smallEnough = numCells < 1_000_000;
          let meshActor: any = null;
          if (smallEnough) {
            const { default: vtkPolyData } = await import(
              '@kitware/vtk.js/Common/DataModel/PolyData'
            );
            const { default: vtkActor } = await import(
              '@kitware/vtk.js/Rendering/Core/Actor'
            );
            const { default: vtkMeshMapper } = await import(
              '@kitware/vtk.js/Rendering/Core/Mapper'
            );
            const { pts, cells } = buildVtiOuterSurface(imageData);
            const pd = vtkPolyData.newInstance();
            pd.getPoints().setData(pts, 3);
            pd.getPolys().setData(cells);
            const mMapper = vtkMeshMapper.newInstance();
            mMapper.setInputData(pd);
            mMapper.setScalarVisibility(false);
            meshActor = vtkActor.newInstance();
            meshActor.setMapper(mMapper);
            meshActor.getProperty().setRepresentationToWireframe();
            meshActor.getProperty().setColor(0.8, 0.8, 0.8);
            meshActor.getProperty().setLineWidth(1);
          }

          vtkRef.current = {
            kind: 'volume',
            renderer,
            renderWindow,
            mapper,
            ctf,
            ofun,
            imageData,
            volume,
            scalarBar,
            hasScalarBar: true,
            slicePlane,
            sliceMapper,
            sliceActor,
            imageBounds: bounds,
            imageCenter,
            meshActor,
            hasMesh: smallEnough,
          };
          initialRef.current = { array: arrays[0] ?? '', range };
          setRenderKind('volume');
          setHasMesh(smallEnough);
          setAzimuth(0);
          setElevation(90);
          setSliceOffset(0);
          setPosRange(initPosRange);
          setAvailableArrays(arrays);
          setSelectedArray(arrays[0] ?? '');
          setDataRange(range);
          setThresholdRange(range);
          setDataInfo({
            type: 'volume',
            numPoints: imageData.getNumberOfPoints() as number,
            dimensions: imageData.getDimensions() as number[],
            spacing: imageData.getSpacing() as number[],
            origin: imageData.getOrigin() as number[],
            bounds: imageData.getBounds() as number[],
            arrays: arrayRanges,
          });
        } else {
          const {
            actor,
            meshActor: surfaceMeshActor,
            mapper,
            arrays,
            range,
            bounds,
            numPoints,
            numCells,
            arrayRanges,
          } = await setupPolyDataRendering(blobUrl, renderer);

          const scalarBar = sbMod.default.newInstance();
          const lut = mapper.getLookupTable?.();
          const hasScalarBar = !!lut;
          if (hasScalarBar) {
            scalarBar.setScalarsToColors(lut);
            renderer.addActor(scalarBar);
            setShowColorbar(true);
          }

          const { default: vtkPlane } = await import(
            '@kitware/vtk.js/Common/DataModel/Plane'
          );
          const surfaceCenter: [number, number, number] = [
            (bounds[0] + bounds[1]) / 2,
            (bounds[2] + bounds[3]) / 2,
            (bounds[4] + bounds[5]) / 2,
          ];
          const initNormal = normalFromAngles(0, 90);
          const initPosRange = computePosRange(
            bounds,
            surfaceCenter,
            initNormal
          );
          const sliceThickness = (initPosRange[1] - initPosRange[0]) * 0.1;
          const halfT = sliceThickness / 2;

          const slicePlane = vtkPlane.newInstance();
          slicePlane.setNormal(...initNormal);
          slicePlane.setOrigin(
            surfaceCenter[0] - halfT * initNormal[0],
            surfaceCenter[1] - halfT * initNormal[1],
            surfaceCenter[2] - halfT * initNormal[2]
          );
          const slicePlane2 = vtkPlane.newInstance();
          slicePlane2.setNormal(-initNormal[0], -initNormal[1], -initNormal[2]);
          slicePlane2.setOrigin(
            surfaceCenter[0] + halfT * initNormal[0],
            surfaceCenter[1] + halfT * initNormal[1],
            surfaceCenter[2] + halfT * initNormal[2]
          );

          vtkRef.current = {
            kind: 'surface',
            renderer,
            renderWindow,
            actor,
            meshActor: surfaceMeshActor,
            mapper,
            scalarBar,
            hasScalarBar,
            slicePlane,
            slicePlane2,
            sliceThickness,
            imageBounds: bounds,
            imageCenter: surfaceCenter,
          };
          initialRef.current = { array: arrays[0] ?? '', range };
          setRenderKind('surface');
          setHasMesh(true);
          setAzimuth(0);
          setElevation(90);
          setSliceOffset(0);
          setPosRange(initPosRange);
          setAvailableArrays(arrays);
          setSelectedArray(arrays[0] ?? '');
          setDataRange(range);
          setThresholdRange(range);
          setDataInfo({
            type: 'surface',
            numPoints,
            numCells,
            bounds,
            arrays: arrayRanges,
          });
        }

        renderer.resetCamera();
        vtkRef.current!.renderWindow.render();
        const cam = renderer.getActiveCamera();
        initialCameraRef.current = {
          position: cam.getPosition() as [number, number, number],
          focalPoint: cam.getFocalPoint() as [number, number, number],
          viewUp: cam.getViewUp() as [number, number, number],
        };
      })
      .catch((err) => setRenderError(err.message));

    return () => {
      mounted = false;
      grwRef.current = null;
      if (orientationWidget) {
        orientationWidget.setEnabled(false);
        orientationWidget.delete();
      }
      if (grw) {
        grw.setContainer(null);
        grw.delete();
      }
    };
  }, [blobUrl]);

  // Auto-resize when the container div changes size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      if (grwRef.current) grwRef.current.resize();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const changeArray = (arrayName: string) => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    setSelectedArray(arrayName);
    if (vtk.kind === 'surface') {
      vtk.mapper.setColorByArrayName(arrayName);
      vtk.mapper.setScalarModeToUsePointFieldData();
    } else {
      vtk.imageData.getPointData().setActiveScalars(arrayName);
      vtk.mapper.modified();
      const arr = vtk.imageData.getPointData().getArrayByName(arrayName);
      if (arr) {
        const newRange = arr.getRange() as [number, number];
        vtk.ctf.removeAllPoints();
        vtk.ctf.addRGBPoint(newRange[0], 0.23, 0.3, 0.75);
        vtk.ctf.addRGBPoint((newRange[0] + newRange[1]) / 2, 0.86, 0.86, 0.86);
        vtk.ctf.addRGBPoint(newRange[1], 0.71, 0.12, 0.11);
        vtk.ofun.removeAllPoints();
        vtk.ofun.addPoint(newRange[0], 0.0);
        vtk.ofun.addPoint(newRange[1], 1.0);
        setDataRange(newRange);
        setThresholdRange(newRange);
      }
    }
    vtk.renderWindow.render();
  };

  const changeThreshold = (range: [number, number]) => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const [min, max] = range;
    setThresholdRange([min, max]);
    if (vtk.kind === 'surface') {
      vtk.mapper.setScalarRange(min, max);
    } else {
      vtk.ofun.removeAllPoints();
      vtk.ofun.addPoint(dataRange[0], 0.0);
      vtk.ofun.addPoint(min, 0.0);
      vtk.ofun.addPoint(min, 0.8);
      vtk.ofun.addPoint(max, 0.8);
      vtk.ofun.addPoint(max, 0.0);
      vtk.ofun.addPoint(dataRange[1], 0.0);
    }
    vtk.renderWindow.render();
  };

  const toggleColorbar = () => {
    const vtk = vtkRef.current;
    if (!vtk || !vtk.hasScalarBar) return;
    if (showColorbar) vtk.renderer.removeActor(vtk.scalarBar);
    else vtk.renderer.addActor(vtk.scalarBar);
    setShowColorbar(!showColorbar);
    vtk.renderWindow.render();
  };

  const toggleMesh = () => {
    const vtk = vtkRef.current;
    if (!vtk || !vtk.meshActor) return;
    const next = !showMesh;
    if (next) vtk.renderer.addActor(vtk.meshActor);
    else vtk.renderer.removeActor(vtk.meshActor);
    setShowMesh(next);
    vtk.renderWindow.render();
  };

  const toggleData = () => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const next = !dataVisible;
    if (vtk.kind === 'surface') {
      if (next) vtk.renderer.addActor(vtk.actor);
      else vtk.renderer.removeActor(vtk.actor);
    } else {
      if (sliceEnabled) {
        if (next) vtk.renderer.addActor(vtk.sliceActor);
        else vtk.renderer.removeActor(vtk.sliceActor);
      } else {
        if (next) vtk.renderer.addVolume(vtk.volume);
        else vtk.renderer.removeVolume(vtk.volume);
      }
    }
    setDataVisible(next);
    vtk.renderWindow.render();
  };

  const toggleSlice = () => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    if (vtk.kind === 'volume') {
      if (sliceEnabled) {
        vtk.renderer.removeActor(vtk.sliceActor);
        vtk.renderer.addVolume(vtk.volume);
      } else {
        vtk.renderer.removeVolume(vtk.volume);
        vtk.renderer.addActor(vtk.sliceActor);
      }
    } else {
      if (sliceEnabled) vtk.mapper.removeAllClippingPlanes();
      else {
        vtk.mapper.addClippingPlane(vtk.slicePlane);
        vtk.mapper.addClippingPlane(vtk.slicePlane2);
      }
    }
    setSliceEnabled(!sliceEnabled);
    vtk.renderWindow.render();
  };

  const applySlicePlane = (
    az: number,
    el: number,
    offset: number,
    vtk: VtkObjects
  ) => {
    const normal = normalFromAngles(az, el);
    if (vtk.kind === 'volume') {
      vtk.slicePlane.setNormal(...normal);
      vtk.slicePlane.setOrigin(
        vtk.imageCenter[0] + offset * normal[0],
        vtk.imageCenter[1] + offset * normal[1],
        vtk.imageCenter[2] + offset * normal[2]
      );
    } else {
      const halfT = vtk.sliceThickness / 2;
      vtk.slicePlane.setNormal(...normal);
      vtk.slicePlane.setOrigin(
        vtk.imageCenter[0] + (offset - halfT) * normal[0],
        vtk.imageCenter[1] + (offset - halfT) * normal[1],
        vtk.imageCenter[2] + (offset - halfT) * normal[2]
      );
      vtk.slicePlane2.setNormal(-normal[0], -normal[1], -normal[2]);
      vtk.slicePlane2.setOrigin(
        vtk.imageCenter[0] + (offset + halfT) * normal[0],
        vtk.imageCenter[1] + (offset + halfT) * normal[1],
        vtk.imageCenter[2] + (offset + halfT) * normal[2]
      );
      vtk.mapper.removeAllClippingPlanes();
      vtk.mapper.addClippingPlane(vtk.slicePlane);
      vtk.mapper.addClippingPlane(vtk.slicePlane2);
    }
    vtk.renderWindow.render();
  };

  const syncNormal = (az: number, el: number) => {
    const [nx, ny, nz] = normalFromAngles(az, el);
    setNormalInput({ x: nx.toFixed(3), y: ny.toFixed(3), z: nz.toFixed(3) });
  };

  const changeAzimuth = (az: number) => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const normal = normalFromAngles(az, elevation);
    const newPosRange = computePosRange(
      vtk.imageBounds,
      vtk.imageCenter,
      normal
    );
    const clampedOffset = Math.max(
      newPosRange[0],
      Math.min(newPosRange[1], sliceOffset)
    );
    setAzimuth(az);
    setPosRange(newPosRange);
    setSliceOffset(clampedOffset);
    syncNormal(az, elevation);
    applySlicePlane(az, elevation, clampedOffset, vtk);
  };

  const changeElevation = (el: number) => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const normal = normalFromAngles(azimuth, el);
    const newPosRange = computePosRange(
      vtk.imageBounds,
      vtk.imageCenter,
      normal
    );
    const clampedOffset = Math.max(
      newPosRange[0],
      Math.min(newPosRange[1], sliceOffset)
    );
    setElevation(el);
    setPosRange(newPosRange);
    setSliceOffset(clampedOffset);
    syncNormal(azimuth, el);
    applySlicePlane(azimuth, el, clampedOffset, vtk);
  };

  const changeOffset = (offset: number) => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    setSliceOffset(offset);
    applySlicePlane(azimuth, elevation, offset, vtk);
  };

  const applyPreset = (preset: 'X' | 'Y' | 'Z') => {
    const presets: Record<string, [number, number]> = {
      X: [0, 0],
      Y: [90, 0],
      Z: [0, 90],
    };
    const [az, el] = presets[preset];
    const vtk = vtkRef.current;
    if (!vtk) return;
    const normal = normalFromAngles(az, el);
    const newPosRange = computePosRange(
      vtk.imageBounds,
      vtk.imageCenter,
      normal
    );
    setAzimuth(az);
    setElevation(el);
    setSliceOffset(0);
    setPosRange(newPosRange);
    syncNormal(az, el);
    applySlicePlane(az, el, 0, vtk);
  };

  const setNormalField = (axis: 'x' | 'y' | 'z', value: string) => {
    setNormalInput((prev) => ({ ...prev, [axis]: value }));
  };

  const applyNormal = () => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const nx = parseFloat(normalInput.x),
      ny = parseFloat(normalInput.y),
      nz = parseFloat(normalInput.z);
    if (isNaN(nx) || isNaN(ny) || isNaN(nz)) return;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len < 1e-10) return;
    const nn: [number, number, number] = [nx / len, ny / len, nz / len];
    const { az, el } = anglesFromNormal(nn[0], nn[1], nn[2]);
    const newPosRange = computePosRange(vtk.imageBounds, vtk.imageCenter, nn);
    const clampedOffset = Math.max(
      newPosRange[0],
      Math.min(newPosRange[1], sliceOffset)
    );
    setNormalInput({
      x: nn[0].toFixed(3),
      y: nn[1].toFixed(3),
      z: nn[2].toFixed(3),
    });
    setAzimuth(az);
    setElevation(el);
    setPosRange(newPosRange);
    setSliceOffset(clampedOffset);
    if (vtk.kind === 'volume') {
      vtk.slicePlane.setNormal(...nn);
      vtk.slicePlane.setOrigin(
        vtk.imageCenter[0] + clampedOffset * nn[0],
        vtk.imageCenter[1] + clampedOffset * nn[1],
        vtk.imageCenter[2] + clampedOffset * nn[2]
      );
      vtk.renderWindow.render();
    } else {
      applySlicePlane(az, el, clampedOffset, vtk);
    }
  };

  const reset = () => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    const init = initialRef.current;
    if (vtk.kind === 'surface') {
      vtk.mapper.removeAllClippingPlanes();
      vtk.renderer.removeActor(vtk.actor);
      vtk.renderer.addActor(vtk.actor);
      if (init && availableArrays.length > 0) {
        vtk.mapper.setColorByArrayName(init.array);
        vtk.mapper.setScalarModeToUsePointFieldData();
        vtk.mapper.setScalarRange(init.range[0], init.range[1]);
      }
    } else {
      vtk.renderer.removeActor(vtk.sliceActor);
      vtk.renderer.removeVolume(vtk.volume);
      vtk.renderer.addVolume(vtk.volume);
      if (init) {
        vtk.imageData.getPointData().setActiveScalars(init.array);
        vtk.mapper.modified();
        vtk.ctf.removeAllPoints();
        vtk.ctf.addRGBPoint(init.range[0], 0.23, 0.3, 0.75);
        vtk.ctf.addRGBPoint(
          (init.range[0] + init.range[1]) / 2,
          0.86,
          0.86,
          0.86
        );
        vtk.ctf.addRGBPoint(init.range[1], 0.71, 0.12, 0.11);
        vtk.ofun.removeAllPoints();
        vtk.ofun.addPoint(init.range[0], 0.0);
        vtk.ofun.addPoint(init.range[1], 1.0);
      }
    }
    if (vtk.meshActor) vtk.renderer.removeActor(vtk.meshActor);
    if (vtk.hasScalarBar) {
      vtk.renderer.removeActor(vtk.scalarBar);
      vtk.renderer.addActor(vtk.scalarBar);
    }
    setSliceEnabled(false);
    setShowMesh(false);
    setDataVisible(true);
    if (vtk.hasScalarBar) setShowColorbar(true);
    if (init) {
      setSelectedArray(init.array);
      setDataRange(init.range);
      setThresholdRange(init.range);
    }
    const initNormal = normalFromAngles(0, 90);
    const initPosRange = computePosRange(
      vtk.imageBounds,
      vtk.imageCenter,
      initNormal
    );
    setAzimuth(0);
    setElevation(90);
    setSliceOffset(0);
    setPosRange(initPosRange);
    setNormalInput({ x: '0.000', y: '0.000', z: '1.000' });
    const cam = initialCameraRef.current;
    const camera = vtk.renderer.getActiveCamera();
    if (cam) {
      camera.setPosition(...cam.position);
      camera.setFocalPoint(...cam.focalPoint);
      camera.setViewUp(...cam.viewUp);
    } else {
      vtk.renderer.resetCamera();
    }
    vtk.renderer.resetCameraClippingRange();
    vtk.renderWindow.render();
  };

  const screenshot = () => {
    const vtk = vtkRef.current;
    if (!vtk) return;
    vtk.renderWindow.render();
    const canvas = containerRef.current?.querySelector(
      'canvas'
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = fileName.replace(/\.[^.]+$/, '') + '_screenshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) containerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  // Keep the parent's handleRef up-to-date with fresh closures on every render
  useLayoutEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      changeArray,
      changeThreshold,
      toggleColorbar,
      toggleMesh,
      toggleData,
      toggleSlice,
      changeAzimuth,
      changeElevation,
      changeOffset,
      applyPreset,
      setNormalField,
      applyNormal,
      reset,
      screenshot,
    };
    return () => {
      if (handleRef) handleRef.current = null;
    };
  });

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Box
      onClick={onActivate}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        outline: isActive
          ? '2px solid #1976d2'
          : '1px solid rgba(255,255,255,0.12)',
        cursor: isActive ? 'default' : 'pointer',
        transition: 'outline 0.15s',
      }}
    >
      {renderError && (
        <Alert severity="error" sx={{ m: 0.5 }}>
          <AlertTitle>Render error</AlertTitle>
          {renderError}
        </Alert>
      )}

      {/* Canvas area with overlay buttons */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* Left overlay: Fullscreen | Reset | Screenshot | Add View */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
        >
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
              sx={overlayBtnSx}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset to initial view">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              sx={overlayBtnSx}
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Screenshot">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                screenshot();
              }}
              sx={overlayBtnSx}
            >
              <CameraAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          {canAddView && (
            <Tooltip title="Add view">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddView?.();
                }}
                sx={overlayBtnSx}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Top-right overlay: Close */}
        {onClose && (
          <Tooltip title="Close pane">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (document.fullscreenElement === containerRef.current)
                  document.exitFullscreen();
                onClose();
              }}
              sx={{
                ...overlayBtnSx,
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                '&:hover': { bgcolor: 'rgba(180,0,0,0.8)' },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Axis label legend — sits at bottom-left over the orientation widget */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {[
            { label: 'X', color: '#ff4444' },
            { label: 'Y', color: '#44dd44' },
            { label: 'Z', color: '#4488ff' },
          ].map(({ label, color }) => (
            <Box
              key={label}
              sx={{
                color,
                fontSize: 11,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                lineHeight: 1,
                textShadow: '0 0 4px #000, 0 0 4px #000',
              }}
              component="span"
            >
              {label}
            </Box>
          ))}
        </Stack>

        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </Box>
  );
};

export default VtkPane;
