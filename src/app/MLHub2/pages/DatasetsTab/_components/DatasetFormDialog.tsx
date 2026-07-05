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
import type { Dataset, DatasetFormat, DatasetStatus } from '../../../types';

const formats: { value: DatasetFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'parquet', label: 'Parquet' },
  { value: 'json', label: 'JSON' },
  { value: 'jsonl', label: 'JSONL' },
  { value: 'image', label: 'Image Collection' },
  { value: 'text', label: 'Text Files' },
  { value: 'delta', label: 'Delta Lake' },
  { value: 'custom', label: 'Custom' },
];

const statuses: { value: DatasetStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'validating', label: 'Validating', color: 'warning' as const },
  { value: 'ready', label: 'Ready', color: 'success' as const },
  { value: 'deprecated', label: 'Deprecated', color: 'error' as const },
  { value: 'archived', label: 'Archived', color: 'default' },
  { value: 'error', label: 'Error', color: 'error' as const },
];

interface DatasetFormDialogProps {
  open: boolean;
  dataset: Dataset | null;
  onClose: () => void;
  onSave: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const emptyForm = {
  name: '',
  description: '',
  format: 'csv' as DatasetFormat,
  version: '1.0.0',
  status: 'draft' as DatasetStatus,
  rowCount: null as number | null,
  size: '',
  tags: [] as string[],
  author: '',
};

export default function DatasetFormDialog({
  open,
  dataset,
  onClose,
  onSave,
}: DatasetFormDialogProps) {
  const [form, setForm] = React.useState(emptyForm);
  const [tagInput, setTagInput] = React.useState('');

  React.useEffect(() => {
    if (dataset) {
      setForm({
        name: dataset.name,
        description: dataset.description,
        format: dataset.format,
        version: dataset.version,
        status: dataset.status,
        rowCount: dataset.rowCount,
        size: dataset.size,
        tags: [...dataset.tags],
        author: dataset.author,
      });
    } else {
      setForm({ ...emptyForm });
      setTagInput('');
    }
  }, [dataset, open]);

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
        {dataset ? 'Edit Dataset' : 'Create New Dataset'}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
      >
        <TextField
          label="Dataset Name"
          value={form.name}
          onChange={handleChange('name')}
          fullWidth
          required
          placeholder="e.g., User Interaction Logs"
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={handleChange('description')}
          fullWidth
          multiline
          rows={3}
          placeholder="Brief description of the dataset contents and purpose..."
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Format"
            value={form.format}
            onChange={handleChange('format')}
            select
            fullWidth
          >
            {formats.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Version"
            value={form.version}
            onChange={handleChange('version')}
            fullWidth
            placeholder="1.0.0"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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

          <TextField
            label="Row Count"
            value={form.rowCount ?? ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                rowCount: e.target.value ? Number(e.target.value) : null,
              }))
            }
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            placeholder="e.g., 5000000"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Size (approximate)"
            value={form.size}
            onChange={handleChange('size')}
            fullWidth
            placeholder="e.g., 2.4 GB, 128 MB"
          />

          <TextField
            label="Author"
            value={form.author}
            onChange={handleChange('author')}
            fullWidth
            placeholder="Dataset owner name"
          />
        </Box>

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
                color="secondary"
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
          {dataset ? 'Update Dataset' : 'Create Dataset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
