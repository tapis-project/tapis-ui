import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Tooltip } from 'reactstrap';
import styles from './AnalysisForm.module.scss';
import { v4 as uuidv4 } from 'uuid';
import {
  Jobs as JobsHooks,
  Apps as AppsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

interface Analysis {
  id: string;
  analysisId: string;
  model: string;
  dataset: string;
  site: string;
  advancedConfig: string;
  modelUrl: string;
  datasetUrl: string;
  device: number | string;
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
  analysisId: 'Analysis',
  model: '',
  dataset: '',
  site: '',
  advancedConfig: '',
  modelUrl: '',
  datasetUrl: '',
  device: '',
};

const validationSchema = Yup.object({
  analysisId: Yup.string().required('Analysis ID is required'),
  model: Yup.string().required('Model is required'),
  dataset: Yup.string().required('Dataset is required'),
  site: Yup.string().required('Site is required'),
  advancedConfig: Yup.string(),
  modelUrl: Yup.string().when('model', {
    is: 'Other',
    then: Yup.string().required('Model URL is required'),
  }),
  datasetUrl: Yup.string().when('dataset', {
    is: 'Other',
    then: Yup.string().required('Dataset URL is required'),
  }),
  device: Yup.string()
    .when('site', {
      is: 'TACC',
      then: Yup.string().required('Device for TACC is required'),
    })
    .when('site', {
      is: 'CHAMELEON',
      then: Yup.string().required('Device for CHAMELEON is required'),
    }),
});

const ML_EDGE_APP_ID = 'ctctrl-icicledev';
const ML_EDGE_APP_VERSION = '0.1';
const ML_EDGE_SYSTEM_ID = 'icicledev-cameratraps';

const devices = [
  {
    id: 1,
    name: 'x86(w/o GPU)',
    type: 'x86',
    site: 'TACC',
    gpu: false,
  },
  {
    id: 2,
    name: 'x86(w GPU)',
    type: 'x86',
    site: 'TACC',
    gpu: true,
  },
  {
    id: 3,
    name: 'Jetson Nano',
    type: 'Jetson Nano',
    site: 'TACC',
    gpu: true,
  },
  {
    id: 4,
    name: 'x86(w/o GPU)',
    type: 'x86',
    site: 'CHAMELEON',
    gpu: false,
  },
  {
    id: 5,
    name: 'x86(w GPU)',
    type: 'x86',
    gpu: true,
    site: 'CHAMELEON',
  },
  {
    id: 6,
    name: 'Jetson Nano',
    type: 'Jetson Nano',
    site: 'CHAMELEON',
    gpu: true,
  },
];

const AnalysisForm: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([initialValues]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const {
    submit,
    isLoading: submitIsLoading,
    isError: submitIsError,
    isSuccess: submitIsSuccess,
  } = JobsHooks.useSubmit(ML_EDGE_APP_ID, ML_EDGE_APP_VERSION);

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
                const date = new Date().toLocaleString();
                const status = 'Done';
                const newAnalysis = {
                  ...values,
                  date,
                  status,
                  report: 'Download',
                };
                const device = devices.filter((d) => d.id == values.device)[0];
                console.log({
                  name: 'ctctrl-tacc',
                  appId: 'ctctrl-icicledev',
                  appVersion: '0.1',
                  description: 'Invoke ctcontroller to run camera-traps',
                  parameterSet: {
                    envVariables: [
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
                    ],
                    archiveFilter: {
                      includeLaunchFiles: false,
                    },
                  },
                });
                submit({
                  name: 'ctctrl-tacc',
                  appId: 'ctctrl-icicledev',
                  appVersion: '0.1',
                  description: 'Invoke ctcontroller to run camera-traps',
                  parameterSet: {
                    envVariables: [
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
                    ],
                    archiveFilter: {
                      includeLaunchFiles: false,
                    },
                  },
                });
                setRecentAnalyses([...recentAnalyses, newAnalysis]);
                resetForm();
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
                    <span id={`modelHelp-${analysis.id}`}>?</span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`modelHelp-${analysis.id}`]}
                      target={`modelHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`modelHelp-${analysis.id}`)}
                    >
                      Select a model
                    </Tooltip>
                    <Input
                      type="select"
                      id={`model-${index}`}
                      name="model"
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
                    >
                      <option value="" label="Select option" />
                      <option value="megadetectorv5a" label="megadetectorv5a" />
                      <option value="megadetectorv5b" label="megadetectorv5b" />
                      <option
                        value="megadetectorv5-ft-ena"
                        label="megadetectorv5-ft-ena"
                      />
                      <option value="bioclip" label="bioclip" />
                      <option value="Other" label="Other" />
                    </Input>
                    {values.model === 'Other' && (
                      <div className={styles.formGroup}>
                        <label htmlFor={`modelUrl-${index}`}>Model URL</label>
                        <Input
                          type="text"
                          id={`modelUrl-${index}`}
                          name="modelUrl"
                          onChange={(e) =>
                            handleChangeAnalysis(
                              index,
                              'modelUrl',
                              e.target.value,
                              setFieldValue,
                              setFieldTouched
                            )
                          }
                          onBlur={handleBlur}
                          value={values.modelUrl}
                          className={
                            errors.modelUrl && touched.modelUrl
                              ? 'is-invalid'
                              : ''
                          }
                        />
                        {errors.modelUrl && touched.modelUrl && (
                          <div className="invalid-feedback">
                            {errors.modelUrl || 'Model URL is required'}
                          </div>
                        )}
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
                    <span id={`datasetHelp-${analysis.id}`}>?</span>
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen[`datasetHelp-${analysis.id}`]}
                      target={`datasetHelp-${analysis.id}`}
                      toggle={() => toggleTooltip(`datasetHelp-${analysis.id}`)}
                    >
                      Select a dataset
                    </Tooltip>
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
                      <option
                        value="15 image dataset"
                        label="15 image dataset"
                      />
                      <option value="ENA dataset" label="ENA dataset" />
                      <option
                        value="Ohio Small Animals dataset"
                        label="Ohio Small Animals dataset"
                      />
                      <option value="Other" label="Other" />
                    </Input>
                    {values.dataset === 'Other' && (
                      <div className={styles.formGroup}>
                        <label htmlFor={`datasetUrl-${index}`}>
                          Dataset URL
                        </label>
                        <Input
                          type="text"
                          id={`datasetUrl-${index}`}
                          name="datasetUrl"
                          onChange={(e) =>
                            handleChangeAnalysis(
                              index,
                              'datasetUrl',
                              e.target.value,
                              setFieldValue,
                              setFieldTouched
                            )
                          }
                          onBlur={handleBlur}
                          value={values.datasetUrl}
                          className={
                            !values.datasetUrl && touched.datasetUrl
                              ? 'is-invalid'
                              : ''
                          }
                        />
                        {!values.datasetUrl && touched.datasetUrl && (
                          <div className="invalid-feedback">
                            {errors.datasetUrl || 'Dataset URL is required'}
                          </div>
                        )}
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
                    <span id={`siteHelp-${analysis.id}`}>?</span>
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
                      <option value="CHAMELEON" label="CHAMELEON" />
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
                              <option value={device.id} label={device.name} />
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
                    <span id={`advancedConfigHelp-${analysis.id}`}>?</span>
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
          submit({
            name: 'ctctrl-tacc',
            appId: 'ctctrl-icicledev',
            appVersion: '0.1',
            description:
              'Invoke ctcontroller to run camera-traps on TACC x86 system',
            parameterSet: {
              envVariables: [
                { key: 'CT_CONTROLLER_TARGET_SITE', value: 'TACC' },
                { key: 'CT_CONTROLLER_NODE_TYPE', value: 'x86' },
                { key: 'CT_CONTROLLER_CONFIG_PATH', value: '/config.yml' },
              ],
            },
          });
          //handleRunAllAnalyses
        }}
        color="primary"
        className={styles.recentAnalysesTable}
      >
        Run All Analyses
      </Button>

      <h2 className={styles.recentAnalysesTable}>Recent Analyses</h2>
      <div className={styles.recentAnalysesTable}>
        <table>
          <thead>
            <tr>
              <th>UUID</th>
              <th>Analysis ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Site</th>
              <th>Model</th>
              <th>Dataset</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {recentAnalyses.map((analysis, index) => (
              <tr key={index}>
                <td>uuid</td>
                <td>{analysis.analysisId}</td>
                <td>{analysis.date}</td>
                <td
                  style={{
                    color:
                      analysis.status === 'Done'
                        ? 'green'
                        : analysis.status === 'Failed'
                        ? 'red'
                        : 'grey',
                  }}
                >
                  {analysis.status}
                </td>
                <td>{analysis.site}</td>
                <td>{analysis.model}</td>
                <td>{analysis.dataset}</td>
                <td>
                  {analysis.status === 'Done' ? (
                    <a href="#">Download</a>
                  ) : analysis.status === 'In Progress' ? (
                    'Pending'
                  ) : (
                    'Unavailable'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalysisForm;
