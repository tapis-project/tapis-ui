import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Tooltip } from 'reactstrap';
import styles from './AnalysisForm.module.scss';
import { Help } from '@mui/icons-material';
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
  devices: string;
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
  analysisId: '',
  model: '',
  dataset: '',
  site: '',
  advancedConfig: '',
  modelUrl: '',
  datasetUrl: '',
  devices: '',
};

// Define the validation schema
const validationSchema = Yup.object().shape({
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
  devices: Yup.string()
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
const ML_EDGE_JOB_DEFINITION = {
  name: '',
  appId: ML_EDGE_APP_ID,
  appVersion: ML_EDGE_APP_VERSION,
  description: 'Invoke ctcontroller',
};

const AnalysisForm: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([initialValues]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const {
    data: appData,
    isLoading: appIsLoading,
    isError: appIsError,
    error: appError,
  } = AppsHooks.useDetail({ appId: ML_EDGE_APP_ID, appVersion: '0.1' });
  const {
    data: systemData,
    isLoading: systemIsLoading,
    isError: systemIsError,
    error: systemError,
  } = SystemsHooks.useDetails({ systemId: ML_EDGE_SYSTEM_ID });
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
    }));
    setRecentAnalyses([...recentAnalyses, ...combinedAnalysis]);
    const uuids = analyses.map((analysis) => analysis.id).join(', ');

    // for (const analysis of analyses) {
    //   const jobDefinition = {
    //     ...ML_EDGE_JOB_DEFINITION,
    //     "name": analysis.analysisId,
    //     "notes":{"batchId": uuids},
    //     "parameterSet": {
    //       "envVariables": [
    //         { key: "CT_CONTROLLER_TARGET_SITE", value: analysis.site },
    //         { key: "CT_CONTROLLER_NODE_TYPE", value: analysis.devices },
    //         { key: "CT_CONTROLLER_CONFIG_PATH", value: analysis.advancedConfig || "/config.yml" },
    //         { key: "CT_CONTROLLER_MODEL", value: analysis.model },
    //         { key: "CT_CONTROLLER_INPUT", value: analysis.dataset }
    //       ],
    //     },
    //   };
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
    <QueryWrapper
      isLoading={appIsLoading || systemIsLoading}
      error={appIsError ? appError : null}
    >
      {}
      {/* {JSON.stringify(systemData && systemData.result)} */}
      <div className={styles.pageContainer}>
        <h1>Configure New Analysis</h1>
        <div className={styles.analysisContainer}>
          {analyses.map((analysis, index) => (
            <div key={analysis.id} className={styles.analysisBox}>
              <div
                className={styles.closeButton}
                onClick={() => removeAnalysis(index)}
              >
                {/* <FontAwesomeIcon icon={faTimes} /> */}X
              </div>
              <Formik
                initialValues={analysis}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                  const jobDef = {
                    ...ML_EDGE_JOB_DEFINITION,
                    name: 'ctctrl-tacc',
                    appId: 'ctctrl-icicledev',
                    appVersion: '0.1',
                    description:
                      'Invoke ctcontroller to run camera-traps on TACC x86 system',
                    parameterSet: {
                      archiveFilter: {
                        includeLaunchFiles: false,
                      },
                      envVariables: [
                        {
                          key: 'CT_CONTROLLER_TARGET_SITE',
                          value: values.site,
                        },
                        {
                          key: 'CT_CONTROLLER_NODE_TYPE',
                          value: values.devices,
                        },
                        {
                          key: 'CT_CONTROLLER_CONFIG_PATH',
                          value: '/config.yml',
                        },
                        {
                          key: 'CT_CONTROLLER_GPU',
                          value:
                            values.devices === 'x86(w/o GPU)'
                              ? 'false'
                              : 'true',
                        },
                      ],
                    },
                  };
                  submit(jobDef);
                  if (submitIsError) {
                    console.error('Submit Error:', submitIsError);
                  }
                  const date = new Date().toLocaleString();
                  const status = 'Done';
                  const newAnalysis = {
                    ...values,
                    date,
                    status,
                    report: 'Download',
                  };
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
                          className={
                            errors.analysisId && touched.analysisId
                              ? 'is-invalid'
                              : ''
                          }
                        />
                      </div>
                      {errors.analysisId && touched.analysisId && (
                        <div className="invalid-feedback">
                          {errors.analysisId}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor={`model-${index}`}>Model</label>

                      <Help
                        id={`modelHelp-${analysis.id}`}
                        style={{
                          cursor: 'pointer',
                          marginLeft: '5px',
                          fontSize: '18px',
                        }}
                      />
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
                        <option
                          value="0"
                          label="megadetectorv5a"
                        />
                        <option value="1" label="megadetectorv5b" />
                        <option value="2" label="megadetectorv5-ft-ena" />
                        <option value="3" label="megadetector-optimized" />
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
                              {errors.modelUrl}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.model && touched.model && (
                        <div className="invalid-feedback">{errors.model}</div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor={`dataset-${index}`}>Dataset</label>
                      <Help
                        id={`datasetHelp-${analysis.id}`}
                        style={{
                          cursor: 'pointer',
                          marginLeft: '5px',
                          fontSize: '18px',
                        }}
                      />
                      <Tooltip
                        placement="top"
                        isOpen={tooltipOpen[`datasetHelp-${analysis.id}`]}
                        target={`datasetHelp-${analysis.id}`}
                        toggle={() =>
                          toggleTooltip(`datasetHelp-${analysis.id}`)
                        }
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
                          errors.dataset && touched.dataset ? 'is-invalid' : ''
                        }
                      >
                        <option value="" label="Select option" />
                        <option
                          value=""
                          label="15 image dataset"
                        />
                        <option
                          value="https://storage.googleapis.com/public-datasets-lila/ena24/ena24.zip"
                          label="ENA dataset"
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
                              errors.datasetUrl && touched.datasetUrl
                                ? 'is-invalid'
                                : ''
                            }
                          />
                          {errors.datasetUrl && touched.datasetUrl && (
                            <div className="invalid-feedback">
                              {errors.datasetUrl}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.dataset && touched.dataset && (
                        <div className="invalid-feedback">{errors.dataset}</div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor={`site-${index}`}>Site</label>
                      <Help
                        id={`siteHelp-${analysis.id}`}
                        style={{
                          cursor: 'pointer',
                          marginLeft: '5px',
                          fontSize: '18px',
                        }}
                      />
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
                          errors.site && touched.site ? 'is-invalid' : ''
                        }
                      >
                        <option value="" label="Select option" />
                        <option value="TACC" label="TACC" />
                        <option value="CHAMELEON" label="CHAMELEON" />
                      </Input>
                      {errors.site && touched.site && (
                        <div className="invalid-feedback">{errors.site}</div>
                      )}
                    </div>

                    {values.site === 'TACC' && (
                      <div className={styles.formGroup}>
                        <label htmlFor={`devices-${index}`}>Devices</label>
                        <Input
                          type="select"
                          id={`devices-${index}`}
                          name="devices"
                          onChange={(e) =>
                            handleChangeAnalysis(
                              index,
                              'devices',
                              e.target.value,
                              setFieldValue,
                              setFieldTouched
                            )
                          }
                          onBlur={handleBlur}
                          value={values.devices}
                          className={
                            errors.devices && touched.devices
                              ? 'is-invalid'
                              : ''
                          }
                        >
                          <option value="" label="Select option" />
                          <option value="x86(w/o GPU)" label="x86(w/o GPU)" />
                          <option value="Jetson" label="Jetson Nano" />
                        </Input>
                        {!values.devices && touched.devices && (
                          <div className="invalid-feedback">
                            {errors.devices}
                          </div>
                        )}
                      </div>
                    )}

                    {values.site === 'CHAMELEON' && (
                      <div className={styles.formGroup}>
                        <label htmlFor={`devices-${index}`}>Devices</label>
                        <Input
                          type="select"
                          id={`devices-${index}`}
                          name="devices"
                          onChange={(e) =>
                            handleChangeAnalysis(
                              index,
                              'devices',
                              e.target.value,
                              setFieldValue,
                              setFieldTouched
                            )
                          }
                          onBlur={handleBlur}
                          value={values.devices}
                          className={
                            !values.devices && touched.devices
                              ? 'is-invalid'
                              : ''
                          }
                        >
                          <option value="" label="Select option" />
                          <option value="compute_cascadelake" label="x86(w/o GPU)-Cascadelake" />
                          <option value="compute_skylake" label="x86(w/o GPU)-Skylake" />
                          <option value="compute_arm64" label="arm(w/0 GPU)" />
                          <option value="gpu_m40" label="x86(w GPU)-M40" />
                          <option value="gpu_p100" label="x86(w GPU)-P100" />
                        </Input>
                        {errors.devices && touched.devices && (
                          <div className="invalid-feedback">
                            {errors.devices}
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
                        isOpen={
                          tooltipOpen[`advancedConfigHelp-${analysis.id}`]
                        }
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
        {analyses.length > 1 && (
          <Button
            onClick={() => {
              handleRunAllAnalyses();
            }}
            color="primary"
            className={styles.recentAnalysesTable}
          >
            Run All Analyses
          </Button>
        )}
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
    </QueryWrapper>
  );
};

export default AnalysisForm;
