import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Label,
  FormGroup,
  Table,
  Row,
  Col,
  Collapse,
  Tooltip,
  Badge,
  Spinner,
} from 'reactstrap';
import { HelpOutline } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Models } from '@mlhub/ts-sdk';
import { QueryWrapper } from '@tapis/tapisui-common';

// Helper component for labels with tooltips
const LabelWithTooltip: React.FC<{
  text: string;
  tooltip: string;
  id: string;
}> = ({ text, tooltip, id }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <>
      <Label>
        {text}{' '}
        <span id={id}>
          <HelpOutline
            fontSize="small"
            style={{
              marginLeft: '4px',
              marginBottom: '2px',
            }}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
          />
        </span>
      </Label>
      <Tooltip
        placement="top"
        isOpen={tooltipOpen}
        target={id}
        toggle={() => setTooltipOpen(!tooltipOpen)}
      >
        {tooltip}
      </Tooltip>
    </>
  );
};

const IngestModel: React.FC = () => {
  const history = useHistory();
  const [platform, setPlatform] = useState<string>('huggingface');
  const [modelId, setModelId] = useState<string>('');
  const [branch, setBranch] = useState<string>('');
  const [remoteBaseUrl, setRemoteBaseUrl] = useState<string>('');
  const [includePaths, setIncludePaths] = useState<string>('');
  const [excludePaths, setExcludePaths] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const { ingest, isLoading, error } =
    Hooks.Models.Ingestions.useIngestModelByPlatform();

  // Fetch all ingestions
  const {
    data: ingestionsData,
    isLoading: isLoadingIngestions,
    error: ingestionsError,
  } = Hooks.Models.Ingestions.useListModelIngestions();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build params object based on platform
    const params: any = {};

    if (platform === 'github' && branch) {
      params.branch = branch;
    } else if (platform === 'git' && remoteBaseUrl) {
      params.remote_base_url = remoteBaseUrl;
      if (branch) params.branch = branch;
    } else if (platform === 'huggingface' && branch) {
      params.branch = branch;
    }

    // Build IngestArtifactRequest according to OpenAPI spec
    const ingestArtifactRequest: any = {
      params, // Required field
    };

    // Add optional fields only if they have values
    if (includePaths) {
      ingestArtifactRequest.include_paths = includePaths
        .split(',')
        .map((p) => p.trim());
    }
    if (excludePaths) {
      ingestArtifactRequest.exclude_paths = excludePaths
        .split(',')
        .map((p) => p.trim());
    }
    if (webhookUrl) {
      ingestArtifactRequest.webhook_url = webhookUrl;
    }

    ingest(
      {
        platform: platform as Models.Platform,
        modelId,
        ingestArtifactRequest,
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

  const handleIngestionClick = (ingestionId: string) => {
    history.push(`/ml-hub/ingestions/${ingestionId}`);
  };

  const ingestions = ingestionsData?.result || [];

  const isBranchRequired = platform === 'github';
  const isRemoteBaseUrlRequired = platform === 'git';

  return (
    <div className="p-3 p-md-4">
      <h2 className="mb-3">Model Ingestion</h2>

      {/* Ingestion Form */}
      <Card className="mb-4">
        <CardHeader tag="h5">Ingest External Model</CardHeader>
        <CardBody>
          <p className="text-muted mb-4">
            Ingest a model artifact from supported platforms. Required fields
            are marked with *. Use Advanced Options for fine-grained control.
          </p>
          <form onSubmit={onSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <LabelWithTooltip
                    text="Platform *"
                    tooltip="The external platform where the model is hosted (Hugging Face, GitHub, or Git repository)"
                    id="platform-tooltip"
                  />
                  <Input
                    type="select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="huggingface">Hugging Face</option>
                    <option value="github">GitHub</option>
                    <option value="git">Git</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <LabelWithTooltip
                    text="Model ID *"
                    tooltip={
                      platform === 'huggingface'
                        ? 'The model identifier on Hugging Face (e.g., bert-base-uncased)'
                        : platform === 'github'
                        ? 'The repository path in format owner/repo (e.g., microsoft/DialoGPT)'
                        : 'The repository path relative to the remote base URL (e.g., mygroup/myrepo)'
                    }
                    id="model-id-tooltip"
                  />
                  <Input
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    disabled={isLoading}
                    placeholder={
                      platform === 'huggingface'
                        ? 'e.g. bert-base-uncased'
                        : platform === 'github'
                        ? 'e.g. owner/repo'
                        : 'e.g. mygroup/myrepo'
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Platform-specific required parameters */}
            {platform === 'github' && (
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Branch *"
                      tooltip="The Git branch to clone from the GitHub repository (required for GitHub platform)"
                      id="github-branch-tooltip"
                    />
                    <Input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g. main, master"
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            {platform === 'git' && (
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Remote Base URL *"
                      tooltip="The base URL of the Git repository (e.g., https://gitlab.com, or your enterprise Git URL)"
                      id="git-url-tooltip"
                    />
                    <Input
                      value={remoteBaseUrl}
                      onChange={(e) => setRemoteBaseUrl(e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g. https://gitlab.com"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Branch (Optional)"
                      tooltip="The Git branch to clone (defaults to the repository's default branch if not specified)"
                      id="git-branch-tooltip"
                    />
                    <Input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g. main, master"
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            {platform === 'huggingface' && (
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Branch (Optional)"
                      tooltip="The specific branch or tag to download from Hugging Face (defaults to main if not specified)"
                      id="hf-branch-tooltip"
                    />
                    <Input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g. main, master"
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            {/* Advanced Options Toggle */}
            <Row>
              <Col>
                <Button
                  type="button"
                  color="link"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-0 text-decoration-none"
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Options (Optional)
                </Button>
              </Col>
            </Row>

            {/* Optional parameters */}
            <Collapse isOpen={showAdvanced}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Include Paths (Optional)"
                      tooltip="Specify which files/folders to include in the ingestion. Use comma-separated paths (e.g., src/, models/, config.json). If not specified, all files are included."
                      id="include-paths-tooltip"
                    />
                    <Input
                      value={includePaths}
                      onChange={(e) => setIncludePaths(e.target.value)}
                      disabled={isLoading}
                      placeholder="src/, models/, config.json (comma-separated)"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Exclude Paths (Optional)"
                      tooltip="Specify which files/folders to exclude from the ingestion. Use comma-separated paths (e.g., tests/, .git/, *.log). These will be filtered out during the ingestion process."
                      id="exclude-paths-tooltip"
                    />
                    <Input
                      value={excludePaths}
                      onChange={(e) => setExcludePaths(e.target.value)}
                      disabled={isLoading}
                      placeholder="tests/, .git/, *.log (comma-separated)"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <LabelWithTooltip
                      text="Webhook URL (Optional)"
                      tooltip="A webhook URL to receive notifications about the ingestion progress. The system will send status updates to this endpoint during the ingestion process."
                      id="webhook-url-tooltip"
                    />
                    <Input
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      disabled={isLoading}
                      placeholder="e.g. https://your-webhook.com/endpoint"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Collapse>

            {error && <div className="text-danger mb-2">{error.message}</div>}
            <Button
              type="submit"
              color="primary"
              disabled={
                isLoading ||
                !modelId ||
                (isBranchRequired && !branch) ||
                (isRemoteBaseUrlRequired && !remoteBaseUrl)
              }
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" /> Starting...
                </>
              ) : (
                'Ingest'
              )}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Ingestions List */}
      <Card>
        <CardHeader tag="h5">Ingestion History</CardHeader>
        <CardBody>
          <p className="text-muted mb-3">
            Click a row to view ingestion details.
          </p>
          <QueryWrapper isLoading={isLoadingIngestions} error={ingestionsError}>
            {ingestions.length === 0 ? (
              <p>No ingestions found.</p>
            ) : (
              <Table striped responsive hover bordered size="sm">
                <thead>
                  <tr>
                    <th>Ingestion ID</th>
                    <th>Platform</th>
                    <th>Model ID</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {ingestions.map((ingestion: any) => (
                    <tr
                      key={ingestion.id}
                      className="cursor-pointer"
                      onClick={() => handleIngestionClick(ingestion.id)}
                    >
                      <td>{ingestion.id}</td>
                      <td>{ingestion.platform}</td>
                      <td>{ingestion.model_id}</td>
                      <td>
                        <Badge
                          color={
                            ingestion.status === 'Finished'
                              ? 'success'
                              : ingestion.status === 'Failed'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {ingestion.status}
                        </Badge>
                      </td>
                      <td>{ingestion.created_at}</td>
                      <td>{ingestion.last_modified}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </QueryWrapper>
        </CardBody>
      </Card>
    </div>
  );
};

export default IngestModel;
