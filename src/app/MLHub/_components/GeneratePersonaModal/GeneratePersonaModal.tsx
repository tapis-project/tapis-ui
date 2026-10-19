import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonaWizard from './PersonaWizard';

export interface GeneratePersonaModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GeneratePersonaModal({
  open,
  onClose,
}: GeneratePersonaModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="generate-persona-title"
    >
      <DialogTitle
        id="generate-persona-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1.5,
        }}
      >
        Curate your workspace
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        <PersonaWizard />
      </DialogContent>
    </Dialog>
  );
}
