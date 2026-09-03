import { useCallback, useState, useEffect, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { GenericModal, SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Formik, Form, FormikProps, Field } from 'formik';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { focusManager } from 'react-query';
import { useFilesSelect } from '../../FilesContext';
import { useFileOperations } from '../_hooks';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const LabelModal: React.FC<ToolbarModalProps> = ({ toggle, systemId }) => {
  const { selectedFiles } = useFilesSelect();
  const { uploadAsync } = Hooks.useUpload();
  const { create } = Hooks.PostIts.useCreate();
  const { reset, isLoading, error, isSuccess } = Hooks.useMove();
  const file = selectedFiles?.[0];
  const [step, setStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postit, setPostit] = useState<string>();
  const createFormikRef = useRef<FormikProps<any>>(null);
  const steps = ['Create', 'Auto', 'Show'];

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const pipeline = (
    <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
      {steps.map((label, index) => (
        <Step key={label} completed={index < step}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  const currentFile = selectedFiles?.[currentIndex];

  useEffect(() => {
    if (
      !currentFile ||
      !systemId ||
      (steps[step] !== 'Show' && steps[step] !== 'Auto')
    )
      return;

    setPostit(undefined);

    create(
      {
        systemId,
        path: currentFile.path!,
        createPostItRequest: {
          allowedUses: 100,
          validSeconds: 300,
        },
      },
      {
        onSuccess: (value) => {
          setPostit(value.result?.redeemUrl);
        },
      }
    );
  }, [currentFile, systemId, step]);

  useEffect(() => {
    reset();
  }, [reset]);

  const getDirPath = (fullPath?: string) => {
    if (!fullPath) return '';
    return fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const { run } = useFileOperations({
    fn: uploadAsync,
    key: (p: any) => p.file.name,
    onComplete: () => {
      focusManager.setFocused(true);
    },
  });

  const handleNext = async () => {
    if (steps[step] === 'Create') {
      const form = createFormikRef.current;
      if (!form) return;

      const { filename, taskname, classname } = form.values;

      const missingFields: string[] = [];

      if (!filename?.trim()) {
        form.setFieldTouched('filename', true);
        form.setFieldError('filename', 'File name is required');
        missingFields.push('File Name');
      }

      if (!taskname?.trim()) {
        form.setFieldTouched('taskname', true);
        form.setFieldError('taskname', 'Task name is required');
        missingFields.push('Task Name');
      }

      if (!classname?.trim()) {
        form.setFieldTouched('classname', true);
        form.setFieldError('classname', 'Class name is required');
        missingFields.push('Class Name');
      }

      if (missingFields.length > 0) {
        showAlert(
          `The following fields are required:\n\n${missingFields.join('\n')}`
        );
        return;
      }

      await form.submitForm();
      nextStep();
      return;
    }
    if (steps[step] === 'Auto') {
      if (!token.trim()) {
        showAlert('Token is required.');
        return;
      }

      try {
        const results = await sendToLlava();

        const data =
          selectedFiles?.map((file) => {
            const llm = results.find((r) => r.image === file.name);

            return {
              image: getImageFullPath(file),
              taskname: formData.taskname,
              classname: formData.classname,
              answer: mapResponseToAnswer(llm?.response ?? ''),
            };
          }) ?? [];

        setAnnotations(data);
        setCurrentIndex(0);
        setAnswer(data[0]?.answer ?? 'yes');

        nextStep();
      } catch (e) {
        setLlmErrorOpen(true);
      }

      return;
    }

    nextStep();
  };

  const prevFile = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const nextFile = () => {
    setCurrentIndex((i) => Math.min((selectedFiles?.length ?? 1) - 1, i + 1));
  };

  const [formData, setFormData] = useState({
    filename: '',
    taskname: '',
    classname: '',
  });

  const getImageFullPath = (file: any) => {
    if (!systemId || !file?.path) return file?.name ?? '';

    return `${systemId}/${file.path}`;
  };

  const onSubmit = useCallback(({ filename, taskname, classname }: any) => {
    setFormData({ filename, taskname, classname });
  }, []);

  const generateJsonFile = () => {
    if (!systemId) return;

    const { filename, taskname, classname } = formData;
    const finalName = `${filename.trim()}.json`;
    let filtered;

    if (saveOption === 'yes') {
      filtered = annotations.filter((item) => item.answer === 'yes');
    } else if (saveOption === 'no') {
      filtered = annotations.filter((item) => item.answer === 'no');
    } else {
      filtered = annotations;
    }
    const jsonContent = JSON.stringify(filtered, null, 2);
    const file = new File([jsonContent], finalName, {
      type: 'application/json',
    });

    const finalPath = getDirPath(selectedFiles?.[0]?.path).replace(/\/+/g, '/');

    run([
      {
        systemId,
        path: finalPath,
        file,
        progressCallback: () => {},
      },
    ]);
  };

  const [answer, setAnswer] = useState<'yes' | 'no' | null>('yes');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const saveAnswer = (value: 'yes' | 'no') => {
    setAnnotations((prev) =>
      prev.map((item, index) =>
        index === currentIndex ? { ...item, answer: value } : item
      )
    );

    setAnswer(value);
  };

  useEffect(() => {
    if (annotations[currentIndex]) {
      setAnswer(annotations[currentIndex].answer);
    }
  }, [currentIndex, annotations]);

  const resetWizard = () => {
    setStep(0);
    setCurrentIndex(0);
    setAnnotations([]);
    setAnswer('yes');

    createFormikRef.current?.resetForm();

    setFormData({
      filename: '',
      taskname: '',
      classname: '',
    });
  };

  const saveJson = () => {
    generateJsonFile();
  };

  const handleNew = () => {
    saveJson();
    resetWizard();
  };

  const handleFinish = () => {
    setSaveDialogOpen(true);
  };

  const confirmSave = () => {
    generateJsonFile();
    setSaveDialogOpen(false);
    toggle();
  };

  const [testingLLM, setTestingLLM] = useState(false);
  const [autoPrompt, setAutoPrompt] = useState('');
  const [token, setToken] = useState('');

  const imageUrlToBase64 = async (url: string) => {
    const response = await fetch(url);

    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };
  const LITELLM_ENDPOINT =
    process.env.NODE_ENV === 'development'
      ? '/api/litellm'
      : 'https://litellm.pods.tacc.tapis.io';

  const processFile = async (
    file: NonNullable<typeof selectedFiles>[number]
  ) => {
    const postit = await new Promise<string>((resolve, reject) => {
      create(
        {
          systemId: systemId!,
          path: file.path!,
          createPostItRequest: {
            allowedUses: 100,
            validSeconds: 300,
          },
        },
        {
          onSuccess: (value) => {
            const url = value.result?.redeemUrl;
            if (url) {
              resolve(url);
            } else {
              reject(new Error('No PostIt URL returned.'));
            }
          },
          onError: reject,
        }
      );
    });

    const base64Image = await imageUrlToBase64(postit);

    const response = await fetch(`${LITELLM_ENDPOINT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tapis-Token': token,
      },
      body: JSON.stringify({
        model: 'llama4-17b',
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: autoPrompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    return data?.choices?.[0]?.message?.content ?? 'No response';
  };

  const [llmErrorOpen, setLlmErrorOpen] = useState(false);

  const [llmResponses, setLlmResponses] = useState<
    { image: string; response: string }[]
  >([]);

  const sendToLlava = async () => {
    if (!selectedFiles?.length) return [];

    setTestingLLM(true);

    try {
      const results: { image: string; response: string }[] = [];

      for (const file of selectedFiles) {
        const response = await processFile(file);

        results.push({
          image: file.name ?? '',
          response,
        });
      }

      setLlmResponses(results);
      return results;
    } catch (error) {
      throw error;
    } finally {
      setTestingLLM(false);
    }
  };

  const mapResponseToAnswer = (response: string): 'yes' | 'no' => {
    const text = response.toLowerCase().trim();

    if (text.startsWith('yes')) return 'yes';
    if (text.startsWith('no')) return 'no';

    return 'yes';
  };

  useEffect(() => {
    if (step !== 2 || !selectedFiles?.length) return;

    setAnnotations(
      selectedFiles.map((file) => {
        const llm = llmResponses.find((item) => item.image === file.name);

        return {
          image: getImageFullPath(file),
          taskname: formData.taskname,
          classname: formData.classname,
          answer: llm ? mapResponseToAnswer(llm.response) : 'yes',
        };
      })
    );
  }, [step, selectedFiles, formData, llmResponses]);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveOption, setSaveOption] = useState<'yes' | 'no' | 'all'>('yes');

  const createTab = (
    <Formik
      innerRef={createFormikRef}
      initialValues={{
        filename: '',
        taskname: '',
        classname: '',
      }}
      onSubmit={async (values, helpers) => {
        await onSubmit({
          filename: values.filename,
          taskname: values.taskname,
          classname: values.classname,
        });
        helpers.setSubmitting(false);
      }}
    >
      {() => (
        <Form>
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Create JSON in{' '}
              <b>
                {systemId}/{getDirPath(file?.path)}
              </b>
            </Typography>

            <Field
              name="filename"
              as={TextField}
              fullWidth
              label="File Name"
              margin="normal"
              placeholder="Required"
            />

            <Field
              name="taskname"
              as={TextField}
              fullWidth
              label="Task Name"
              margin="normal"
              placeholder="Required"
            />

            <Field
              name="classname"
              as={TextField}
              fullWidth
              label="Class Name"
              margin="normal"
              placeholder="Required"
            />
          </Box>
        </Form>
      )}
    </Formik>
  );

  const autoLabelerTab = (
    <Box>
      <TextField
        fullWidth
        multiline
        label="Token"
        placeholder="Required"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Prompt"
        value={autoPrompt}
        onChange={(e) => setAutoPrompt(e.target.value)}
        margin="normal"
      />
    </Box>
  );

  const showTab = (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton onClick={prevFile} disabled={currentIndex === 0}>
          <KeyboardArrowLeftIcon />
        </IconButton>

        <Box textAlign="center">
          {postit ? (
            <iframe
              src={postit}
              width="100%"
              height="500"
              style={{ border: 'none' }}
              title={currentFile?.name}
            />
          ) : (
            <Typography>Loading...</Typography>
          )}

          <Typography>
            {currentIndex + 1} / {selectedFiles?.length}
          </Typography>

          <p>
            Does this image belong to{' '}
            <b style={{ color: 'red' }}>"{formData.classname}"</b>?
          </p>

          <Button
            variant={answer === 'yes' ? 'contained' : 'outlined'}
            onClick={() => saveAnswer('yes')}
          >
            Yes
          </Button>

          <Button
            variant={answer === 'no' ? 'contained' : 'outlined'}
            sx={{ ml: 2 }}
            onClick={() => saveAnswer('no')}
          >
            No
          </Button>
        </Box>

        <IconButton
          onClick={nextFile}
          disabled={currentIndex === (selectedFiles?.length ?? 1) - 1}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const tabContents: Record<string, React.ReactNode> = {
    Create: createTab,
    Auto: autoLabelerTab,
    Show: showTab,
  };

  return (
    <>
      <GenericModal
        toggle={toggle}
        title="Metadata Generator"
        size="xl"
        body={
          <>
            {pipeline}
            {tabContents[steps[step]]}
          </>
        }
        footer={
          <SubmitWrapper
            isLoading={isLoading}
            error={error}
            success={isSuccess ? 'Success' : ''}
            reverse
          >
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={() => {
                  if (step === steps.length - 1) {
                    handleFinish();
                  } else {
                    handleNext();
                  }
                }}
                disabled={isLoading || testingLLM}
              >
                {testingLLM
                  ? 'Processing...'
                  : step === steps.length - 1
                  ? 'Finish'
                  : 'Next'}
              </Button>
            </Box>
          </SubmitWrapper>
        }
      />
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)}>
        <DialogTitle>Missing Information</DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ whiteSpace: 'pre-line' }}>
            {alertMessage}
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAlertOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={llmErrorOpen} onClose={() => setLlmErrorOpen(false)}>
        <DialogTitle>LLM Request Error</DialogTitle>

        <DialogContent>
          <Typography>fail request</Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setLlmErrorOpen(false);
              setStep(1); // back to Auto
            }}
          >
            Continue
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setLlmErrorOpen(false);

              // skip Auto, go Show
              setStep(2);
            }}
          >
            Skip
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Select Images to Save</DialogTitle>

        <DialogContent>
          <RadioGroup
            value={saveOption}
            onChange={(e) =>
              setSaveOption(e.target.value as 'yes' | 'no' | 'all')
            }
          >
            <FormControlLabel
              value="yes"
              control={<Radio />}
              label='All images with "Yes"'
            />

            <FormControlLabel
              value="no"
              control={<Radio />}
              label='All images with "No"'
            />

            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All images"
            />
          </RadioGroup>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={confirmSave}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LabelModal;
