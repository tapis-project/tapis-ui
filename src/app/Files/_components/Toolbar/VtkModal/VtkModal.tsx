import { useEffect, useRef, useState } from 'react';
import { GenericModal } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useFilesSelect } from '../../FilesContext';
import { Alert, AlertTitle } from '@mui/material';

const renderPolyData = async (
  postit: string,
  renderer: any,
  renderWindow: any
) => {
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
  const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();

  mapper.setInputConnection(reader.getOutputPort());
  actor.setMapper(mapper);
  renderer.addActor(actor);

  await reader.setUrl(postit);
  await reader.loadData();
  renderer.resetCamera();
  renderWindow.render();
};

const renderImageData = async (
  postit: string,
  renderer: any,
  renderWindow: any
) => {
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
  await reader.setUrl(postit);
  await reader.loadData();

  const imageData = reader.getOutputData(0);
  const dataRange = imageData.getPointData().getScalars().getRange();

  const mapper = vtkVolumeMapper.newInstance();
  mapper.setInputData(imageData);

  // color: black → white across data range
  const ctf = vtkColorTransferFunction.newInstance();
  ctf.addRGBPoint(dataRange[0], 0, 0, 0);
  ctf.addRGBPoint(dataRange[1], 1, 1, 1);

  // opacity: transparent at low values, opaque at high values
  const ofun = vtkPiecewiseFunction.newInstance();
  ofun.addPoint(dataRange[0], 0.0);
  ofun.addPoint(dataRange[1], 1.0);

  const volume = vtkVolume.newInstance();
  volume.setMapper(mapper);
  volume.getProperty().setRGBTransferFunction(0, ctf);
  volume.getProperty().setScalarOpacity(0, ofun);

  renderer.addVolume(volume);
  renderer.resetCamera();
  renderWindow.render();
};

const VtkModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [postit, setPostit] = useState<string | undefined>(undefined);
  const [renderError, setRenderError] = useState<string | undefined>(undefined);
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, isError, error } = Hooks.PostIts.useCreate();
  const fileName = selectedFiles[0]?.name ?? '';
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const maxFileSize = 25 * 1024 * 1024; // 25MB
  const fileTooLarge = (selectedFiles[0]?.size ?? 0) > maxFileSize;

  // Step 1: get a temporary download URL for the selected file
  useEffect(() => {
    if (fileTooLarge) return;
    create(
      {
        systemId,
        path: selectedFiles[0].path!,
        createPostItRequest: {
          allowedUses: 1,
          validSeconds: 300,
        },
      },
      {
        onSuccess: (value) => {
          setPostit(value.result?.redeemUrl);
        },
      }
    );
  }, [systemId, path]);

  // Step 2: once URL is ready, pick pipeline based on file extension
  useEffect(() => {
    if (!postit || !containerRef.current) return;

    let fullScreenRenderer: any;

    Promise.all([
      import('@kitware/vtk.js/Rendering/Profiles/Geometry'),
      import('@kitware/vtk.js/Rendering/Profiles/Volume'),
      import('@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow'),
    ])
      .then(async ([, , fswModule]) => {
        const vtkFullScreenRenderWindow = fswModule.default;

        fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
          container: containerRef.current,
        });
        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();
        renderer.setBackground(0.1, 0.1, 0.1);

        if (fileExt === 'vti') {
          await renderImageData(postit, renderer, renderWindow);
        } else {
          await renderPolyData(postit, renderer, renderWindow);
        }
      })
      .catch((err) => setRenderError(err.message));

    return () => {
      if (fullScreenRenderer) fullScreenRenderer.delete();
    };
  }, [postit]);

  return (
    <GenericModal
      size="xl"
      toggle={() => {
        toggle();
        unselect(selectedFiles);
      }}
      title={`VTK Viewer — ${fileName}`}
      body={
        <div>
          {fileTooLarge && (
            <Alert severity="error">
              <AlertTitle>File Too Large</AlertTitle>
              This file exceeds the 25MB limit for visualization. File size:{' '}
              {(selectedFiles[0].size! / (1024 * 1024)).toFixed(1)}MB
            </Alert>
          )}
          {isError && error && (
            <Alert severity="error">
              <AlertTitle>Error loading file</AlertTitle>
              {error.message}
            </Alert>
          )}
          {renderError && (
            <Alert severity="error">
              <AlertTitle>Error rendering file</AlertTitle>
              {renderError}
            </Alert>
          )}
          {!fileTooLarge && (
            <div
              ref={containerRef}
              style={{ width: '100%', height: '600px' }}
            />
          )}
        </div>
      }
    />
  );
};

export default VtkModal;
