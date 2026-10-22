import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';

// Mirrors the Python `Job(BaseModel)` schema
export interface Job {
  name: string;
  exec_system_id: string;
  cores_per_node: number;
  memory_mb: number;
  max_minutes: number;
  billing_account: string;
  ds_path_name: string;
  ds_path_source_url: string;
  ds_path: string;
  task_type: string;
  split_func: string;
  eval_type: string;
  gen_strat: string;
  metric: string;
  err_path: string;
  params_path: string;
  bags: number;
  eval_iterations: number;
}

const initialValues: Job = {
  name: '',
  exec_system_id: '',
  cores_per_node: 1,
  memory_mb: 1024,
  max_minutes: 60,
  billing_account: '',
  ds_path_name: '',
  ds_path_source_url: '',
  ds_path: '',
  task_type: 'reg',
  split_func: 'split_20',
  eval_type: 'avg_bag',
  gen_strat: 'best',
  metric: 'mae + rmse - r2',
  err_path: '',
  params_path: '',
  bags: 3,
  eval_iterations: 3,
};

const validationSchema = Yup.object({
  name: Yup.string().required('Required'),
  exec_system_id: Yup.string().required('Required'),
  cores_per_node: Yup.number().integer().min(1).required('Required'),
  memory_mb: Yup.number().integer().min(1).required('Required'),
  max_minutes: Yup.number().integer().min(1).required('Required'),
  billing_account: Yup.string().required('Required'),
  ds_path_name: Yup.string().required('Required'),
  ds_path_source_url: Yup.string()
    .matches(
      /^(https?:\/\/|tapis:\/\/)\S+$/,
      'Must be a valid URL or a tapis:// URI (e.g. tapis://system-id/path)'
    )
    .required('Required'),
  ds_path: Yup.string().required('Required'),
  task_type: Yup.string().required('Required'),
  split_func: Yup.string().required('Required'),
  eval_type: Yup.string().required('Required'),
  gen_strat: Yup.string().required('Required'),
  metric: Yup.string().required('Required'),
  err_path: Yup.string().required('Required'),
  params_path: Yup.string().required('Required'),
  bags: Yup.number().integer().min(1).required('Required'),
  eval_iterations: Yup.number().integer().min(1).required('Required'),
});

const numericFields = new Set([
  'cores_per_node',
  'memory_mb',
  'max_minutes',
  'bags',
  'eval_iterations',
]);

const AutoOptTabularForm: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const submitEndpoint =
    'https://autoopttabularservice.pods.icicleai.tapis.io/run_job';

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik<Job>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setSubmitError(null);
      setSubmitSuccess(null);

      if (!jwt) {
        setSubmitError(
          'No Tapis access token found. Please log in again before submitting a job.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': jwt,
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(
            `Job submission failed (${response.status}): ${errBody}`
          );
        }

        const result = await response.json();
        setSubmitSuccess(`Job submitted successfully. Job ID: ${result}`);
        formik.resetForm();
      } catch (err: any) {
        setSubmitError(err.message ?? 'An unknown error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const renderField = (fieldName: keyof Job, label: string) => (
    <Grid size={{ xs: 12, sm: 6 }} key={fieldName}>
      <TextField
        fullWidth
        id={fieldName}
        name={fieldName}
        label={label}
        type={numericFields.has(fieldName) ? 'number' : 'text'}
        value={formik.values[fieldName]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[fieldName] && Boolean(formik.errors[fieldName])}
        helperText={
          formik.touched[fieldName] && (formik.errors[fieldName] as string)
        }
      />
    </Grid>
  );

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 900, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Submit AutoOptTabular Job
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {renderField('name', 'Job Name')}
            {renderField('exec_system_id', 'Execution System ID')}
            {renderField('cores_per_node', 'Cores per Node')}
            {renderField('memory_mb', 'Memory (MB)')}
            {renderField('max_minutes', 'Max Minutes')}
            {renderField('billing_account', 'Billing Account')}
            {renderField('ds_path_name', 'Dataset Path Name')}
            {renderField('ds_path_source_url', 'Dataset Source URL')}
            {renderField('ds_path', 'Dataset Path')}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                id="task_type"
                name="task_type"
                label="Task Type"
                value={formik.values.task_type}
                onChange={formik.handleChange}
              >
                <MenuItem value="reg">Regression (reg)</MenuItem>
                <MenuItem value="cls">Classification (cls)</MenuItem>
              </TextField>
            </Grid>

            {renderField('split_func', 'Split Function')}
            {renderField('eval_type', 'Eval Type')}
            {renderField('gen_strat', 'Generation Strategy')}
            {renderField('metric', 'Metric')}
            {renderField('err_path', 'Error Path')}
            {renderField('params_path', 'Params Path')}
            {renderField('bags', 'Bags')}
            {renderField('eval_iterations', 'Eval Iterations')}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Submit Job'}
            </Button>
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          {submitSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {submitSuccess}
            </Alert>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default AutoOptTabularForm;
