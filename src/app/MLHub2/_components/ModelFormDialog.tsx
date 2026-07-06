import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import type { Model, InferenceBackend } from '../types';
import {
  INFERENCE_BACKEND_OPTIONS,
  MODEL_STATUS_OPTIONS,
  inferenceBackendLabelMap,
} from '../enums';

interface ModelFormDialogProps {
  open: boolean;
  model: Model | null;
  onClose: () => void;
  onSave: (model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const emptyForm = {
  name: '',
  description: '',
  libraries: [] as InferenceBackend[],
  version: '1.0.0',
  status: 'draft' as Model['status'],
  f1Score: null as number | null,
  tags: [] as string[],
  author: '',
};

export default function ModelFormDialog({
  open,
  model,
  onClose,
  onSave,
}: ModelFormDialogProps) {
  const [form, setForm] = React.useState(emptyForm);
  const [tagInput, setTagInput] = React.useState('');

  React.useEffect(() => {
    if (model) {
      setForm({
        name: model.name,
        description: model.description,
        libraries: [...model.libraries],
        version: model.version,
        status: model.status,
        f1Score: model.f1Score,
        tags: [...model.tags],
        author: model.author,
      });
    } else {
      setForm({ ...emptyForm });
      setTagInput('');
    }
  }, [model, open]);

  const handleChange =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | unknown
    ) => {
      const value =
        event && typeof event === 'object' && 'target' in event
          ? (event.target as HTMLInputElement).value
          : event;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleLibraryToggle = (libValue: InferenceBackend) => {
    setForm((prev) => ({
      ...prev,
      libraries: prev.libraries.includes(libValue)
        ? prev.libraries.filter((l) => l !== libValue)
        : [...prev.libraries, libValue],
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToDelete),
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ typography: 'h6', pb: 1 }}>
        {model ? 'Edit Model' : 'Create New Model'}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        <TextField
          label="Model Name"
          value={form.name}
          onChange={handleChange('name')}
          fullWidth
          required
          placeholder="e.g., Customer Churn Predictor"
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={handleChange('description')}
          fullWidth
          multiline
          rows={3}
          placeholder="Brief description of the model's purpose..."
        />

        {/* Inference Backends multi-select */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Inference Backends
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
            {form.libraries.map((lib) => (
              <Chip
                key={lib}
                label={inferenceBackendLabelMap[lib] ?? lib}
                size="small"
                onDelete={() => handleLibraryToggle(lib)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {INFERENCE_BACKEND_OPTIONS.filter(
              (f) => !form.libraries.includes(f.value)
            ).map((f) => (
              <Chip
                key={f.value}
                label={`+ ${f.label}`}
                size="small"
                variant="outlined"
                onClick={() => handleLibraryToggle(f.value)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Version"
            value={form.version}
            onChange={handleChange('version')}
            fullWidth
            placeholder="1.0.0"
          />

          <TextField
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            select
            fullWidth
          >
            {MODEL_STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={s.label} size="small" color={s.color} />
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="F1 Score (%)"
            value={form.f1Score ?? ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                f1Score: e.target.value ? Number(e.target.value) : null,
              }))
            }
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 100, step: 0.01 } }}
            placeholder="e.g., 94.5"
          />

          <TextField
            label="Author"
            value={form.author}
            onChange={handleChange('author')}
            fullWidth
            placeholder="Model owner name"
          />
        </Box>

        {/* Tags */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
            {form.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onDelete={() => handleDeleteTag(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              size="small"
              placeholder="Add a tag and press Enter"
              fullWidth
            />
            <Button variant="outlined" size="small" onClick={handleAddTag}>
              Add
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.name.trim()}
        >
          {model ? 'Update Model' : 'Create Model'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
