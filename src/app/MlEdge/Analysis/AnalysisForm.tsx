import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input } from 'reactstrap';
import styles from './AnalysisForm.module.scss';

const initialValues = {
  analysisId: 'Analysis', // Default initial value for demonstration
  model: '',
  dataset: '',
  hardware: '',
  advancedConfig: '',
};

const validationSchema = Yup.object({
  analysisId: Yup.string().required('Analysis ID is required'),
  model: Yup.string().required('Model is required'),
  dataset: Yup.string().required('Dataset is required'),
  hardware: Yup.string().required('Hardware is required'),
  advancedConfig: Yup.string(),
});

const AnalysisForm: React.FC = () => {
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [analyses, setAnalyses] = useState([initialValues]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

  const addNewAnalysis = () => {
    if (analyses.length < 3) {
      setAnalyses([...analyses, initialValues]);
    }
  };

  const toggleEditMode = (index: number) => {
    setEditMode({ ...editMode, [index]: !editMode[index] });
  };

  const handleRunAllAnalyses = () => {
    const combinedAnalysis = analyses.map((analysis, index) => ({
      ...analysis,
      analysisId: `${analysis.analysisId}`,
      date: new Date().toLocaleString(),
      status: 'Done',
      report: 'Pending',
    }));
    setRecentAnalyses([...recentAnalyses, ...combinedAnalysis]);
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Configure New Analysis</h1>
      <div className={styles.analysisContainer}>
        {analyses.map((analysis, index) => (
          <div key={index} className={styles.analysisBox}>
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
                setRecentAnalyses([...recentAnalyses, newAnalysis]);
                resetForm();
              }}
            >
              {({ values, handleChange, handleBlur, handleSubmit, errors, touched }) => (
                <Form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    {editMode[index] ? (
                      <div className={styles.editableField}>
                        <Input
                          type="text"
                          id="analysisId"
                          name="analysisId"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.analysisId}
                          className={touched.analysisId && errors.analysisId ? 'is-invalid' : ''}
                        />
                        <Button size="sm" onClick={() => toggleEditMode(index)}>Save</Button>
                      </div>
                    ) : (
                      <div className={styles.editableField}>
                        <span>{values.analysisId}</span>
                        <Button size="sm" onClick={() => toggleEditMode(index)}>Edit</Button>
                      </div>
                    )}
                    {touched.analysisId && errors.analysisId ? (
                      <div className="invalid-feedback">{errors.analysisId}</div>
                    ) : null}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="model">Model</label>
                    <Input
                      type="select"
                      id="model"
                      name="model"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.model}
                      className={touched.model && errors.model ? 'is-invalid' : ''}
                    >
                      <option value="" label="Select option" />
                      <option value="megadetectorv5a" label="megadetectorv5a" />
                      <option value="megadetectorv5b" label="megadetectorv5b" />
                      <option value="megadetectorv5-ft-ena" label="megadetectorv5-ft-ena" />
                      <option value="bioclip" label="bioclip" />
                    </Input>
                    {touched.model && errors.model ? (
                      <div className="invalid-feedback">{errors.model}</div>
                    ) : null}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="dataset">Dataset</label>
                    <Input
                      type="select"
                      id="dataset"
                      name="dataset"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.dataset}
                      className={touched.dataset && errors.dataset ? 'is-invalid' : ''}
                    >
                      <option value="" label="Select option" />
                      <option value="15 image dataset" label="15 image dataset" />
                      <option value="ENA dataset " label="ENA dataset" />
                      <option value="Ohio Small Animals dataset" label="Ohio Small Animals dataset" />
                      <option value="Other" label="Other" />
                    </Input>
                    {touched.dataset && errors.dataset ? (
                      <div className="invalid-feedback">{errors.dataset}</div>
                    ) : null}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="hardware">Hardware</label>
                    <Input
                      type="select"
                      id="hardware"
                      name="hardware"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.hardware}
                      className={touched.hardware && errors.hardware ? 'is-invalid' : ''}
                    >
                      <option value="" label="Select option" />
                      <option value="hardware1" label="Hardware 1" />
                      <option value="hardware2" label="Hardware 2" />
                    </Input>
                    {touched.hardware && errors.hardware ? (
                      <div className="invalid-feedback">{errors.hardware}</div>
                    ) : null}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="advancedConfig">Advanced Config</label>
                    <Input
                      type="textarea"
                      id="advancedConfig"
                      name="advancedConfig"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.advancedConfig}
                      className={touched.advancedConfig && errors.advancedConfig ? 'is-invalid' : ''}
                    />
                    {touched.advancedConfig && errors.advancedConfig ? (
                      <div className="invalid-feedback">{errors.advancedConfig}</div>
                    ) : null}
                  </div>

                  <Button type="submit" color="primary">Analyze</Button>
                </Form>
              )}
            </Formik>
          </div>
        ))}
        {analyses.length < 3 && (
          <div className={styles.newAnalysisBox} onClick={addNewAnalysis}>
            <span>Add New Analysis</span>
          </div>
        )}
      </div>
      <Button onClick={handleRunAllAnalyses} color="primary" className={styles.recentAnalysesTable}>Run All Analyses</Button>

      <h2 className={styles.recentAnalysesTable}>Recent Analyses</h2>
      <div className={styles.recentAnalysesTable}>
        <table>
          <thead>
            <tr>
              <th>UUID</th>
              <th>Analysis ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Hardware</th>
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
                <td style={{ color: analysis.status === 'Done' ? 'green' : analysis.status === 'Failed' ? 'red' : 'grey' }}>
                  {analysis.status}
                </td>
                <td>{analysis.hardware}</td>
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
