import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Label, FormGroup } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Models } from '@mlhub/ts-sdk';

const IngestModel: React.FC = () => {
  const history = useHistory();
  const [platform, setPlatform] = useState<string>('HuggingFace');
  const [modelId, setModelId] = useState<string>('');
  const { ingestModel, isLoading, error } = (
    Hooks.Models.Platforms as any
  ).useIngestModel();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ingestModel(
      {
        platform: platform as Models.Platform,
        modelId,
      },
      {
        onSuccess: (resp: Models.IngestModelArtifactResponse) => {
          const ingestionId = resp.result?.id as string;
          if (ingestionId) {
            history.push(`/ml-hub/ingestions/${ingestionId}`);
          }
        },
      }
    );
  };

  return (
    <Card>
      <CardBody>
        <h4>Ingest External Model</h4>
        <form onSubmit={onSubmit}>
          <FormGroup>
            <Label>Platform</Label>
            <Input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="HuggingFace"
            />
          </FormGroup>
          <FormGroup>
            <Label>Model ID</Label>
            <Input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g. bert-base-uncased"
            />
          </FormGroup>
          {error && (
            <div style={{ color: 'red', marginBottom: 8 }}>{error.message}</div>
          )}
          <Button
            type="submit"
            color="primary"
            disabled={isLoading || !modelId}
          >
            {isLoading ? 'Starting...' : 'Ingest'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default IngestModel;
