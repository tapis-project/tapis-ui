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
  FormControl,
  InputLabel,
} from '@mui/material';
import type { Model, ModelFramework, ModelStatus } from '../../../types';

const frameworks: { value: ModelFramework; label: string }[] = [
  { value: 'pytorch', label: 'PyTorch' },
  { value: 'tensorflow', label: 'TensorFlow' },
  { value: 'sklearn', label: 'Scikit-learn' },
  { value: 'xgboost', label: 'XGBoost' },
  { value: 'onnx', label: 'ONNX' },
  { value: 'custom', label: 'Custom' },
];

const statuses: { value: ModelStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'ready', label: 'Ready', color: 'success' as const },
  { value: 'deprecated', label: 'Deprecated', color: 'error' as const },
  { value: 'archived', label: 'Archived', color: 'default' },
];

interface ModelFormDialogProps {
  open: boolean;
  model: Model | null;
  onClose: () => void;
  onSave: (model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const emptyForm = {
  name: '',
  description: '',
  framework: [] as ModelFramework[],
  version: '1.0.0',
  status: 'draft' as ModelStatus,
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
        framework: [...model.framework],
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

  const handleFrameworkToggle = (fwValue: ModelFramework) => {
    setForm((prev) => ({
      ...prev,
      framework: prev.framework.includes(fwValue)
        ? prev.framework.filter((f) => f !== fwValue)
        : [...prev.framework, fwValue],
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

        {/* Framework multi-select */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Frameworks
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
            {form.framework.map((fw) => {
              const label = frameworks.find((f) => f.value === fw)?.label ?? fw;
              return (
                <Chip
                  key={fw}
                  label={label}
                  size="small"
                  onDelete={() => handleFrameworkToggle(fw)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {frameworks
              .filter((f) => !form.framework.includes(f.value))
              .map((f) => (
                <Chip
                  key={f.value}
                  label={`+ ${f.label}`}
                  size="small"
                  variant="outlined"
                  onClick={() => handleFrameworkToggle(f.value)}
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
            {statuses.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={s.label}
                    size="small"
                    color={
                      s.color as 'success' | 'error' | 'warning' | 'default'
                    }
                  />
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
