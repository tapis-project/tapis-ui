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
  Alert,
  Badge,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

const PublishModel: React.FC = () => {
  const history = useHistory();
  const [artifactId, setArtifactId] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>('HuggingFace');

  const { publish, isLoading, error, isSuccess, reset } =
    Hooks.Models.Publications.usePublishModelArtifact();

  // Fetch all publications to display
  const {
    data: publicationsData,
    isLoading: isLoadingPublications,
    error: publicationsError,
  } = Hooks.Models.Publications.useListModelPublications();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!artifactId || !targetPlatform) {
      return;
    }

    publish(
      {
        artifactId,
        publishArtifactRequest: {
          target_platform: targetPlatform,
        },
      },
      {
        onSuccess: (resp: any) => {
          const publicationId = resp.result?.id as string;
          if (publicationId) {
            setTimeout(() => {
              history.push(`/ml-hub/publications/${publicationId}`);
            }, 1500);
          }
        },
      }
    );
  };

  const handlePublicationClick = (publicationId: string) => {
    history.push(`/ml-hub/publications/${publicationId}`);
  };

  const publications = publicationsData?.result || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
      case 'Completed':
      case 'Success':
        return 'success';
      case 'Failed':
      case 'Error':
        return 'danger';
      case 'Publishing':
      case 'InProgress':
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-3 p-md-4">
      <h2 className="mb-3">Publish Model</h2>

      {/* Publish Form */}
      <Card className="mb-4">
        <CardHeader tag="h5">Publish Model Artifact</CardHeader>
        <CardBody>
          <p className="text-muted mb-4">
            Publish a model artifact to an external platform like HuggingFace.
          </p>

          <form onSubmit={onSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="artifactId">
                    Artifact ID <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="artifactId"
                    value={artifactId}
                    onChange={(e) => setArtifactId(e.target.value)}
                    placeholder="Enter artifact ID"
                    required
                  />
                  <small className="form-text text-muted">
                    The ID of the artifact you want to publish
                  </small>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="targetPlatform">
                    Target Platform <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    id="targetPlatform"
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value)}
                    required
                  >
                    <option value="HuggingFace">Hugging Face</option>
                  </Input>
                  <small className="form-text text-muted">
                    Select the platform where you want to publish your model
                  </small>
                </FormGroup>
              </Col>
            </Row>

            {error && (
              <Alert color="danger" className="mt-3">
                <strong>Error:</strong> {(error as any).message}
              </Alert>
            )}

            {isSuccess && (
              <Alert color="success" className="mt-3">
                <strong>Success!</strong> Model publication initiated.
                Redirecting to publication details...
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="submit"
                color="primary"
                disabled={isLoading || !artifactId || !targetPlatform}
              >
                {isLoading ? 'Publishing...' : 'Publish Model'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Recent Publications */}
      <Card>
        <CardHeader tag="h5">Recent Publications</CardHeader>
        <CardBody>
          <QueryWrapper
            isLoading={isLoadingPublications}
            error={publicationsError}
          >
            {publications.length === 0 ? (
              <p className="text-muted">No publications yet.</p>
            ) : (
              <Table striped responsive hover size="sm">
                <thead>
                  <tr>
                    <th>Publication ID</th>
                    <th>Artifact ID</th>
                    <th>Target Platform</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((publication: any) => (
                    <tr
                      key={publication.id}
                      className="cursor-pointer"
                      onClick={() => handlePublicationClick(publication.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{publication.id}</td>
                      <td>{publication.artifact_id}</td>
                      <td>{publication.target_platform}</td>
                      <td>
                        <Badge color={getStatusColor(publication.status)}>
                          {publication.status}
                        </Badge>
                      </td>
                      <td>
                        {new Date(publication.created_at).toLocaleDateString()}
                      </td>
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

export default PublishModel;
