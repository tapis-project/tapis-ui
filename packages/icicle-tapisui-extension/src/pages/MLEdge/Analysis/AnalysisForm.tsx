import React, { useCallback, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Tooltip } from 'reactstrap';
import styles from './AnalysisForm.module.scss';
import { v4 as uuidv4 } from 'uuid';
import { Jobs as JobsHooks } from '@tapis/tapisui-hooks';
import {
  ML_EDGE_ANALYSIS_JOB_NAME,
  ML_EDGE_APP_ID,
  ML_EDGE_APP_VERSION,
  ML_EDGE_SYSTEM_ID,
} from '../constants';
import { QueryWrapper, JobStatusIcon } from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { Chip, Stack } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';

interface Analysis {
  id: string;
  analysisId: string;
  model: string;
  dataset: string;
  site: string;
  advancedConfig: string;
  device: number | string;
  mode: string | undefined;
  version: string | undefined;
}

interface ErrorDetail {
  path: string;
  message: string;
}

interface ValidationResult {
  allValid: boolean;
  errorsList: { index: number; errors: ErrorDetail[] }[];
}

const initialValues: Analysis = {
  id: uuidv4(),
  analysisId: ML_EDGE_ANALYSIS_JOB_NAME,
  model: '',
  dataset: '',
  site: '',
  advancedConfig: '',
  device: '',
  mode: '',
  version: '0.6.0',
};

const validationSchema = Yup.object({
  analysisId: Yup.string().required('Analysis ID is required'),
  model: Yup.string().required('Model is required'),
  dataset: Yup.string().required('Dataset is required'),
  site: Yup.string().required('Site is required'),
  advancedConfig: Yup.string(),
  device: Yup.string()
    .when('site', {
      is: 'TACC',
      then: Yup.string().required('Device for TACC is required'),
    })
    .when('site', {
      is: 'CHI@TACC',
      then: Yup.string().required('Device for CHAMELEON is required'),
    }),
});

const ct_controller_versions = ['latest', '0.3.3', '0.4.0', '0.5.0', '0.6.0'];

const devices = [
  {
    id: 1,
    name: 'x86',
    type: 'x86',
    site: 'TACC',
    gpu: false,
    disabled: false,
  },
  {
    id: 2,
    name: 'x86 (no GPU)',
    type: 'compute_cascadelake',
    site: 'CHI@TACC',
    gpu: true,
    disabled: false,
  },
  {
    id: 3,
    name: 'Jetson Nano',
    type: 'Jetson',
    site: 'TACC',
    gpu: true,
    disabled: false,
  },
  {
    id: 4,
    name: 'x86 (gpu_p100)',
    type: 'gpu_p100',
    gpu: true,
    site: 'CHI@TACC',
    disabled: false,
  },
  {
    id: 5,
    name: 'x86 (gpu_m40)',
    type: 'gpu_m40',
    gpu: true,
    site: 'CHI@TACC',
    disabled: false,
  },
  {
    id: 6,
    name: 'x86 (gpu_k80)',
    type: 'gpu_k80',
    gpu: true,
    site: 'CHI@TACC',
    disabled: false,
  },
  {
    id: 7,
    name: 'Raspberry Pi',
    type: 'RaspberryPi',
    gpu: false,
    site: 'TACC',
    disabled: false,
  },
];

const models = [
  {
    modelId: 'megadetectorv5-ft-kudu',
    name: 'MegaDetector v5 (FT Kudu)',
    description: undefined,
    disabled: true,
    config: {
      use_ultralytics: false,
    },
  },
  {
    modelId: '41d3ed40-b836-4a62-b3fb-67cee79f33d9-model',
    name: 'MegaDetector v5a',
    description: 'Microsoft Megadetector trained on dataset A',
    disabled: false,
    config: {
      use_ultralytics: false,
    },
  },
  {
    modelId: '4108ed9d-968e-4cfe-9f18-0324e5399a97-model',
    name: 'MegaDetector v5b',
    description: 'Microsoft Megadetector trained on dataset B',
    disabled: false,
    config: {},
  },
  {
    modelId: '665e7c60-7244-470d-8e33-a232d5f2a390-model',
    name: 'MegaDetector v5-optimized',
    description:
      'Version of the MS Megadetector base model optimized for throughput',
    disabled: false,
    config: {
      use_ultralytics: false,
    },
  },
  {
    modelId: '04867339-530b-44b7-b66e-5f7a52ce4d90-model',
    name: 'MegaDetector v5c',
    description: undefined,
    disabled: true,
    config: {
      use_ultralytics: false,
    },
  },
  {
    modelId: 'megadetectorv5-ft-ena',
    name: 'MegaDetector v5 (FT ENA)',
    description: undefined,
    disabled: true,
    config: {
      use_ultralytics: false,
    },
  },
  {
    modelId: 'bioclip',
    name: 'BioClip',
    description: undefined,
    disabled: true,
    config: {},
  },
  {
    modelId:
      '9103066540bd614ee580637971ff79ef385b8a9d19c3c99160acf8cc83da0952-model',
    name: 'MegaDetector v6b-yolov9c',
    description: undefined,
    disabled: false,
    config: {},
  },
];

const datasets = [
  {
    id: '15-image',
    url: '',
    name: '15 Image',
    disabled: false,
    type: 'image',
  },
  {
    id: 'ena',
    url: 'https://storage.googleapis.com/public-datasets-lila/ena24/ena24.zip',
    name: 'ENA',
    disabled: true,
    type: 'image',
  },
  {
    id: 'ohio-small-animals',
    url: 'ohio-small-animals',
    name: 'Ohio Small Animals',
    disabled: true,
    type: 'image',
  },
  {
    id: 'okavango-delta',
    url: 'okavango-delta',
    name: 'Okavango Delta',
    disabled: true,
    type: 'image',
  },
  {
    id: 'example',
    url: '',
    name: 'Example',
    disabled: false,
    type: 'video',
  },
];

const secondsToDhms = (seconds: number) => {
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + 'd ' : '';
  var hDisplay = h > 0 ? h + 'h ' : '';
  var mDisplay = m > 0 ? m + 'm ' : '';
  var sDisplay = s > 0 ? s + 's ' : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
};

const AnalysisForm: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([initialValues]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isProvidedModelId, setIsProvidedModelId] = useState(false);
  const [isProvidedDatasetId, setIsProvidedDatasetId] = useState(false);
  const {
    submit,
    isLoading: submitIsLoading,
    isError: submitIsError,
    isSuccess: submitIsSuccess,
    error: isSubmitError,
  } = JobsHooks.useSubmit(ML_EDGE_APP_ID, ML_EDGE_APP_VERSION);

  const {
    data,
    isLoading: listIsLoading,
    isError: listIsError,
    isSuccess: listIsSuccess,
    error: listError,
  } = JobsHooks.useSearchSQL({
    computeTotal: true,
    select: 'allAttributes',
    body: {
      search: [`name = '${ML_EDGE_ANALYSIS_JOB_NAME}'`],
    },
  });

  const jobs = data?.result ?? [];

  const filteredJobs = jobs.sort((a, b) => {
    let atime = new Date(a.created).getTime();
    let btime = new Date(b.created).getTime();

    if (atime > btime) {
      return -1;
    }
    if (atime < btime) {
      return 1;
    }
    return 0;
  });

  const toggleTooltip = (id: string) => {
    setTooltipOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const addNewAnalysis = () => {
    if (analyses.length < 5) {
      setAnalyses([...analyses, { ...initialValues, id: uuidv4() }]);
    }
  };

  const removeAnalysis = (index: number) => {
    const delAnalyses = [...analyses];
    delAnalyses.splice(index, 1);
    setAnalyses(delAnalyses);
  };

  const validateAllForms = async (): Promise<ValidationResult> => {
    let allValid = true;
    let errorsList: { index: number; errors: ErrorDetail[] }[] = [];

    for (let i = 0; i < analyses.length; i++) {
      try {
        await validationSchema.validate(analyses[i], { abortEarly: false });
      } catch (err: any) {
        allValid = false;

        const fieldErrors: ErrorDetail[] = err.inner.map((error: any) => ({
          path: error.path,
          message: error.message,
        }));

        errorsList.push({ index: i, errors: fieldErrors });
      }
    }

    return { allValid, errorsList };
  };

  const handleRunAllAnalyses = async () => {
    const { allValid, errorsList } = await validateAllForms();
    if (!allValid) {
      highlightErrors(errorsList);
      return;
    }

    const combinedAnalysis = analyses.map((analysis) => ({
      ...analysis,
      analysisId: `${analysis.analysisId}`,
      date: new Date().toLocaleString(),
      status: 'Done',
      report: 'Pending',
    }));
    setRecentAnalyses([...recentAnalyses, ...combinedAnalysis]);
  };

  const highlightErrors = (
    errorsList: { index: number; errors: ErrorDetail[] }[]
  ) => {
    errorsList.forEach(({ index, errors }) => {
      errors.forEach((error) => {
        const element = document.getElementById(`${error.path}-${index}`);
        if (element) {
          element.classList.add('is-invalid');
          const existingFeedback = element.nextElementSibling;
          if (
            !existingFeedback ||
            !existingFeedback.classList.contains('invalid-feedback')
          ) {
            element.insertAdjacentHTML(
              'afterend',
              `<div class="invalid-feedback">${error.message}</div>`
            );
          }
        }
      });
    });
  };

  const handleChangeAnalysis = (
    index: number,
    field: string,
    value: string,
    setFieldValue: any,
    setFieldTouched: any
  ) => {
    const updatedAnalyses = analyses.map((analysis, i) =>
      i === index ? { ...analysis, [field]: value } : analysis
    );
    setAnalyses(updatedAnalyses);
    setFieldValue(field, value);
    setFieldTouched(field, true);
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Configure New Analysis</h1>
      <div className={styles.analysisContainer}>
        {analyses.map((analysis, index) => (
          <div key={analysis.id} className={styles.analysisBox}>
            <div
              className={styles.closeButton}
              onClick={() => removeAnalysis(index)}
            >
              X
            </div>
            <Formik
              initialValues={analysis}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                const dataset = datasets.filter(
                  (d) => d.id == values.dataset
                )[0];
                const model = models.filter(
                  (m) => m.modelId == values.model
                )[0];
                const device = devices.filter((d) => d.id == values.device)[0];
                const envVariables = [
                  {
                    key: 'CT_CONTROLLER_CT_VERSION',
                    value: values.version,
                  },
                  {
                    key: 'CT_CONTROLLER_TARGET_SITE',
                    value: values.site,
                  },
                  {
                    key: 'CT_CONTROLLER_NODE_TYPE',
                    value: device.type,
                  },
                  {
                    key: 'CT_CONTROLLER_CONFIG_PATH',
                    value: '/config.yml',
                  },
                  {
                    key: 'CT_CONTROLLER_GPU',
                    value: device.gpu ? 'true' : 'false',
                  },
                  {
                    key: 'CT_CONTROLLER_MODEL',
                    value: values.model,
                  },
                  {
                    key: 'CT_CONTROLLER_MODE',
                    value: mode,
                  },
                  {
                    key: 'CT_CONTROLLER_INPUT',
                    // HACK ctcontroller expects an empty string for the 15-image dataset,
                    // which is why we are using a ternary operator below
                    // HACK the default value for the default video dataset should be an empty string also
                    value:
                      values.dataset === '15-image' ||
                      values.dataset === 'example'
                        ? 'example'
                        : values.dataset,
                  },
                  {
                    key: 'CT_CONTROLLER_NUM_NODES',
                    value: '1',
                  },
                ];

                // Add advnacedConfig to the envVariables to if defined
                if (values.advancedConfig || model.config !== undefined) {
                  let modelConfig = model.config || {};
                  let advancedConfig = values.advancedConfig || {};

                  envVariables.push({
                    key: 'CT_CONTROLLER_ADVANCED_APP_VARS',
                    value: JSON.stringify({
                      ...modelConfig,
                      ...advancedConfig,
                    }),
                  });
                }

                submit(
                  {
                    name: ML_EDGE_ANALYSIS_JOB_NAME,
                    appId: ML_EDGE_APP_ID,
                    execSystemId: ML_EDGE_SYSTEM_ID,
                    appVersion: ML_EDGE_APP_VERSION,
                    description: 'Invoke ctcontroller to run camera-traps',
                    parameterSet: {
                      envVariables,
                      archiveFilter: {
                        includeLaunchFiles: false,
                      },
                    },
                    notes: {
                      model: values.model,
                      site: values.site,
                      dataset: values.dataset,
                      device: device.type,
                      gpu: device.gpu,
                    },
                  },
                  {
                    onSuccess: () => {
                      resetForm();
                    },
                    onError: (e) => {
                      console.log(e);
                    },
                  }
                );
              }}
            >
              {({
                values,
                handleBlur,
                handleSubmit,
                setFieldTouched,
                setFieldValue,
                errors,
                touched,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor={`analysisId-${index}`}>Analysis ID</label>
                    <div className={styles.editableField}>
                      <Input
                        type="text"
                        id={`analysisId-${index}`}
                        name="analysisId"
                        disabled
                        onChange={(e) =>
                          handleChangeAnalysis(
                            index,
                            'analysisId',
                            e.target.value,
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                        onBlur={handleBlur}
                        value={values.analysisId}
                      />
                    </div>
                    {!values.analysisId && touched.analysisId && (
                      <div className="invalid-feedback">
                        {errors.analysisId || 'Analysis ID is required'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor={`model-${index}`}>Model</label>
                    <span id={`modelHelp-${analysis.id}`}>
                      <HelpOutline
                        fontSize="small"
                        style={{
                          cursor: 'help',
                          marginLeft: '4px',
                          marginBottom: '2px',
                        }}
                      />
                    </span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`modelHelp-${analysis.id}`]}
                      target={`modelHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`modelHelp-${analysis.id}`)}
                    >
                      Select a model
                    </Tooltip>
                    <Stack
                      direction={'row'}
                      spacing={1}
                      style={{ marginBottom: '8px' }}
                    >
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="select a model"
                        color={isProvidedModelId ? 'default' : 'primary'}
                        onClick={() => {
                          setIsProvidedModelId(false);
                        }}
                      />
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="provide model id"
                        color={!isProvidedModelId ? 'default' : 'primary'}
                        onClick={() => {
                          setIsProvidedModelId(true);
                        }}
                      />
                    </Stack>
                    {!isProvidedModelId && (
                      <Input
                        type="select"
                        id={`model-${index}`}
                        name="model"
                        onChange={(e) => {
                          handleChangeAnalysis(
                            index,
                            'model',
                            e.target.value,
                            setFieldValue,
                            setFieldTouched
                          );
                        }}
                        onBlur={handleBlur}
                        value={values.model}
                      >
                        <option value="" label="Select option" />
                        {models.map((model) => {
                          return (
                            <option
                              disabled={model.disabled}
                              value={model.modelId}
                            >
                              {model.name}
                              {model.description
                                ? ` - ${model.description}`
                                : ''}
                            </option>
                          );
                        })}
                      </Input>
                    )}
                    {isProvidedModelId && (
                      <div>
                        <div className={styles.formGroup}>
                          <Input
                            type="text"
                            id={`model`}
                            name="model"
                            placeholder="Provide a Model Id"
                            onChange={(e) =>
                              handleChangeAnalysis(
                                index,
                                'model',
                                e.target.value,
                                setFieldValue,
                                setFieldTouched
                              )
                            }
                            onBlur={handleBlur}
                            value={values.model}
                            className={
                              errors.model && touched.model ? 'is-invalid' : ''
                            }
                          />
                          {errors.model && touched.model && (
                            <div className="invalid-feedback">
                              {errors.model || 'Model Id is required'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {errors.model && touched.model && (
                      <div className="invalid-feedback">
                        {errors.model || 'Model is required'}
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor={`dataset-${index}`}>Dataset</label>
                    <span id={`datasetHelp-${analysis.id}`}>
                      <HelpOutline
                        fontSize="small"
                        style={{
                          cursor: 'help',
                          marginLeft: '4px',
                          marginBottom: '2px',
                        }}
                      />
                    </span>
                    <Stack
                      direction={'row'}
                      spacing={1}
                      style={{ marginBottom: '8px' }}
                    >
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="images"
                        color={mode !== 'image' ? 'default' : 'primary'}
                        onClick={() => {
                          setMode('image');
                        }}
                      />
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="videos"
                        color={mode !== 'video' ? 'default' : 'primary'}
                        onClick={() => {
                          setMode('video');
                        }}
                      />
                    </Stack>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`datasetHelp-${analysis.id}`]}
                      target={`datasetHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`datasetHelp-${analysis.id}`)}
                    >
                      Select a dataset
                    </Tooltip>
                    <Stack
                      direction={'row'}
                      spacing={1}
                      style={{ marginBottom: '8px' }}
                    >
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="select a dataset"
                        color={isProvidedDatasetId ? 'default' : 'primary'}
                        onClick={() => {
                          setIsProvidedDatasetId(false);
                        }}
                      />
                      <Chip
                        style={{ cursor: 'pointer' }}
                        size="small"
                        label="provide dataset id"
                        color={!isProvidedDatasetId ? 'default' : 'primary'}
                        onClick={() => {
                          setIsProvidedDatasetId(true);
                        }}
                      />
                    </Stack>
                    {!isProvidedDatasetId && (
                      <Input
                        type="select"
                        id={`dataset-${index}`}
                        name="dataset"
                        onChange={(e) =>
                          handleChangeAnalysis(
                            index,
                            'dataset',
                            e.target.value,
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                        onBlur={handleBlur}
                        value={values.dataset}
                        className={
                          !values.dataset && touched.dataset ? 'is-invalid' : ''
                        }
                      >
                        <option value="" label="Select option" />
                        {datasets
                          .filter((dataset) => dataset.type == mode)
                          .map((dataset) => {
                            return (
                              <option
                                disabled={dataset.disabled}
                                value={dataset.id}
                                label={`${dataset.name} (${dataset.type})`}
                              />
                            );
                          })}
                      </Input>
                    )}
                    {isProvidedDatasetId && (
                      <div>
                        <div className={styles.formGroup}>
                          <Input
                            type="text"
                            id={`dataset`}
                            name="dataset"
                            placeholder="Provide a Dataset Id"
                            onChange={(e) =>
                              handleChangeAnalysis(
                                index,
                                'dataset',
                                e.target.value,
                                setFieldValue,
                                setFieldTouched
                              )
                            }
                            onBlur={handleBlur}
                            value={values.dataset}
                            className={
                              errors.dataset && touched.dataset
                                ? 'is-invalid'
                                : ''
                            }
                          />
                          {errors.dataset && touched.dataset && (
                            <div className="invalid-feedback">
                              {errors.dataset || 'Dataset Id is required'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {!values.dataset && touched.dataset && (
                      <div className="invalid-feedback">
                        {errors.dataset || 'Dataset is required'}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor={`site-${index}`}>Site</label>
                    <span id={`siteHelp-${analysis.id}`}>
                      <HelpOutline
                        fontSize="small"
                        style={{
                          cursor: 'help',
                          marginLeft: '4px',
                          marginBottom: '2px',
                        }}
                      />
                    </span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`siteHelp-${analysis.id}`]}
                      target={`siteHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`siteHelp-${analysis.id}`)}
                    >
                      Select a site
                    </Tooltip>
                    <Input
                      type="select"
                      id={`site-${index}`}
                      name="site"
                      onChange={(e) =>
                        handleChangeAnalysis(
                          index,
                          'site',
                          e.target.value,
                          setFieldValue,
                          setFieldTouched
                        )
                      }
                      onBlur={handleBlur}
                      value={values.site}
                      className={
                        !values.site && touched.site ? 'is-invalid' : ''
                      }
                    >
                      <option value="" label="Select option" />
                      <option value="TACC" label="TACC" />
                      <option value="CHI@TACC" label="CHAMELEON" />
                    </Input>
                    {!values.site && touched.site && (
                      <div className="invalid-feedback">
                        {errors.site || 'Site is required'}
                      </div>
                    )}
                  </div>

                  {values.site && (
                    <div className={styles.formGroup}>
                      <label htmlFor={`device-${index}`}>Devices</label>
                      <Input
                        type="select"
                        id={`device-${index}`}
                        name="device"
                        onChange={(e) =>
                          handleChangeAnalysis(
                            index,
                            'device',
                            e.target.value,
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                        onBlur={handleBlur}
                        value={values.device}
                        className={
                          !values.device && touched.device ? 'is-invalid' : ''
                        }
                      >
                        <option value="" label="Select option" />
                        {devices.map((device) => {
                          if (device.site === values.site) {
                            return (
                              <option
                                disabled={device.disabled}
                                value={device.id}
                                label={device.name}
                              />
                            );
                          }
                        })}
                      </Input>
                      {!values.device && touched.device && (
                        <div className="invalid-feedback">
                          {errors.device || 'Device is required'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label htmlFor={`advancedConfig-${index}`}>
                      Advanced Config
                    </label>
                    <span id={`advancedConfigHelp-${analysis.id}`}>
                      <HelpOutline
                        fontSize="small"
                        style={{
                          cursor: 'help',
                          marginLeft: '4px',
                          marginBottom: '2px',
                        }}
                      />
                    </span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`advancedConfigHelp-${analysis.id}`]}
                      target={`advancedConfigHelp-${analysis.id}`}
                      toggle={() =>
                        toggleTooltip(`advancedConfigHelp-${analysis.id}`)
                      }
                    >
                      Enter advanced configuration
                    </Tooltip>
                    <Input
                      type="textarea"
                      id={`advancedConfig-${index}`}
                      name="advancedConfig"
                      onChange={(e) =>
                        handleChangeAnalysis(
                          index,
                          'advancedConfig',
                          e.target.value,
                          setFieldValue,
                          setFieldTouched
                        )
                      }
                      onBlur={handleBlur}
                      value={values.advancedConfig}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor={`version-${index}`}>Version</label>
                    <span id={`versionHelp-${analysis.id}`}>
                      <HelpOutline
                        fontSize="small"
                        style={{
                          cursor: 'help',
                          marginLeft: '4px',
                          marginBottom: '2px',
                        }}
                      />
                    </span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`versionHelp-${analysis.id}`]}
                      target={`versionHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`versionHelp-${analysis.id}`)}
                    >
                      Version
                    </Tooltip>
                    <Input
                      type="select"
                      id={`version-${index}`}
                      name="version"
                      onChange={(e) =>
                        handleChangeAnalysis(
                          index,
                          'version',
                          e.target.value,
                          setFieldValue,
                          setFieldTouched
                        )
                      }
                      onBlur={handleBlur}
                      value={values.version}
                      className={
                        !values.version && touched.version ? 'is-invalid' : ''
                      }
                    >
                      {ct_controller_versions.map((v) => {
                        return (
                          <option
                            selected={v === '0.6.0'}
                            value={v}
                            label={v === 'latest' ? 'pre-release' : v}
                          />
                        );
                      })}
                    </Input>
                    {!values.site && touched.site && (
                      <div className="invalid-feedback">
                        {errors.site || 'Site is required'}
                      </div>
                    )}
                  </div>
                  <Button type="submit" color="primary">
                    Analyze
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        ))}
        {analyses.length < 5 && (
          <div className={styles.newAnalysisBox} onClick={addNewAnalysis}>
            <span>Add New Analysis</span>
          </div>
        )}
      </div>
      <Button
        onClick={() => {
          alert('Run All Analyses functionality unavailable');
          // submit({
          //   name: 'ctctrl-tacc',
          //   appId: 'ctctrl-icicledev',
          //   appVersion: '0.1',
          //   description:
          //     'Invoke ctcontroller to run camera-traps on TACC x86 system',
          //   parameterSet: {
          //     envVariables: [
          //       { key: 'CT_CONTROLLER_TARGET_SITE', value: 'TACC' },
          //       { key: 'CT_CONTROLLER_NODE_TYPE', value: 'x86' },
          //       { key: 'CT_CONTROLLER_CONFIG_PATH', value: '/config.yml' },
          //     ],
          //   },
          // });
          //handleRunAllAnalyses
        }}
        color="primary"
        className={styles.recentAnalysesTable}
      >
        Run All Analyses
      </Button>

      <h2 className={styles.recentAnalysesTable}>Analyses</h2>
      <QueryWrapper isLoading={listIsLoading} error={listError}>
        <div style={{ width: '100%' }}>
          <DataGrid
            getRowHeight={() => 'auto'}
            rows={filteredJobs.map((job) => {
              const age =
                Math.floor(Date.now() / 1000) -
                Math.floor(new Date(job.created!).getTime() / 1000);

              let notes: any = job.notes;

              // TODO Use useMemo for this function
              let filteredModels = models.filter((m) => {
                return m.modelId === notes.model;
              });

              let modelName =
                filteredModels.length >= 1 && filteredModels[0] !== undefined
                  ? filteredModels[0].name
                  : 'unknown';

              return {
                id: job.uuid!,
                age: `${secondsToDhms(age)} ago`,
                startedAt: job.created!,
                endedAt: job.ended!,
                status: job.status!,
                uuid: job.uuid!,
                gpu: notes.gpu !== undefined ? notes.gpu.toString() : 'unknown',
                site: notes.site,
                model: modelName,
                dataset:
                  notes.dataset !== undefined ? notes.dataset : 'unknown',
                device: notes.device,
              };
            })}
            sx={{
              [`& .${gridClasses.cell}`]: {
                py: 1,
              },
              '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                borderRight: '1px solid #f0f0f0',
              },
            }}
            columns={[
              {
                field: 'age',
                headerName: 'Submitted',
                width: 150,
              },
              {
                field: 'status',
                width: 150,
                hideSortIcons: true,
                disableColumnMenu: true,
                renderCell: (params) => {
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                      }}
                    >
                      <JobStatusIcon status={params.row.status!} />
                      <span style={{ marginLeft: '8px', lineHeight: '24px' }}>
                        {params.row.status}
                      </span>
                    </div>
                  );
                },
              },
              {
                field: 'device',
                headerName: 'Device',
                width: 100,
              },
              {
                field: 'gpu',
                headerName: 'GPU',
                width: 100,
              },
              {
                field: 'model',
                headerName: 'Model',
                width: 200,
              },
              {
                field: 'dataset',
                headerName: 'Dataset',
                width: 200,
              },
              {
                field: 'startedAt',
                headerName: 'Started at',
                width: 100,
                hideSortIcons: false,
                sortable: true,
              },
              {
                field: 'endedAt',
                headerName: 'Ended at',
                width: 100,
                hideSortIcons: false,
                sortable: true,
              },
              {
                field: 'uuid',
                headerName: 'UUID',
                width: 100,
                renderCell: (params) => (
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {params.row.uuid}
                  </div>
                ),
              },
              {
                field: 'results',
                hideSortIcons: true,
                disableColumnMenu: true,
                renderCell: (params) => {
                  return <Link to={`/jobs/${params.row.uuid}`}>View</Link>;
                },
              },
            ]}
            autosizeOptions={{
              includeOutliers: false,
            }}
            rowSelection={false}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>
      </QueryWrapper>
    </div>
  );
};

export default AnalysisForm;
