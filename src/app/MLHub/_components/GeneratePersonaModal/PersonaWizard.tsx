import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ProfessionStep from './ProfessionStep';
import WorkflowStep from './WorkflowStep';
import PersonaSummary from './PersonaSummary';
import { useSavePersona } from './useSavePersona';
import { generatePersona } from './generatePersona';
import type { Persona, PersonaAnswers } from './types';

const STEPS = ['Your profession', 'Your workflows', 'Your workspace'];

const EMPTY_ANSWERS: PersonaAnswers = {
  profession: '',
  workflows: [],
  experienceLevel: 'intermediate',
};

export default function PersonaWizard() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<PersonaAnswers>(EMPTY_ANSWERS);
  const [persona, setPersona] = React.useState<Persona | null>(null);
  const { save, saving, savedPersona } = useSavePersona();

  const handleChange = React.useCallback((patch: Partial<PersonaAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  const canContinue =
    activeStep === 0
      ? answers.profession !== ''
      : activeStep === 1
      ? answers.workflows.length > 0
      : true;

  const handleNext = () => {
    if (activeStep === 1 && !persona) {
      setPersona(generatePersona(answers));
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSkip = () => {
    setPersona(generatePersona(EMPTY_ANSWERS));
    setActiveStep(2);
  };

  const handleSave = async () => {
    if (!persona) return;
    try {
      await save(persona);
    } catch {
      // Error state is surfaced by the hook; summary stays visible.
    }
  };

  const handleRegenerate = () => {
    setPersona(generatePersona(answers));
    setActiveStep(1);
  };

  return (
    <Stack spacing={4}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <ProfessionStep answers={answers} onChange={handleChange} />
      )}
      {activeStep === 1 && (
        <WorkflowStep answers={answers} onChange={handleChange} />
      )}
      {activeStep === 2 && persona && (
        <PersonaSummary
          persona={persona}
          onSave={handleSave}
          saving={saving}
          saved={savedPersona?.id === persona.id}
          onRegenerate={handleRegenerate}
        />
      )}

      {activeStep < 2 && (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Button onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canContinue}
          >
            {activeStep === 1 ? 'Create my workspace' : 'Continue'}
          </Button>
        </Stack>
      )}

      {activeStep < 2 && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Not sure yet? You can set everything up later.
          </Typography>
          <Button size="small" onClick={handleSkip}>
            Skip, you&apos;ll get the default setup
          </Button>
        </Box>
      )}
    </Stack>
  );
}
