import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { Box } from '@mui/material';
import { SettingsZone, SettingsAction } from '../../../_components';

interface SettingsSection {
  model: ModelMetadata;
}

export function SettingsSection({ model }: SettingsSection) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        flexDirection: 'column',
      }}
    >
      <SettingsZone title="Visibility & Archiving" severity="warning">
        <SettingsAction
          title="Change model visibility"
          description={`This model is currently private. Changing it to public will make it visible to anyone in your tenant.`}
          buttonText="Change visibility"
          severity="warning"
          onAction={() => {
            alert('Model public');
          }}
          confirmMessage="Are you sure you want to make this model public?"
        />

        <SettingsAction
          title="Archive this model"
          description="Mark this model as archived and read-only. You will no longer be able to update the model's metadata"
          buttonText="Archive"
          severity="warning"
          onAction={() => alert('Model archived')}
          confirmMessage="Are you sure you want to archive this model? It will become read-only."
        />
      </SettingsZone>

      <SettingsZone title="Danger Zone" severity="danger">
        <SettingsAction
          title="Delete model"
          description={`Permanently delete this model. You will no longer be able to update or deploy this model.`}
          buttonText="Delete Model"
          severity="danger"
          onAction={() => {
            alert('Model deleted');
          }}
          confirmMessage="This model will be deleted permanently. You will no longer be able to update or deploy this model. This action is irrevocable."
          itemName={model.name}
        />
      </SettingsZone>
    </Box>
  );
}
