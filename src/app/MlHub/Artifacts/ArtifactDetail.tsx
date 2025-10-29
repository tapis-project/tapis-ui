import React from 'react';
import { Card, CardBody, CardHeader, Table, Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

type Props = { artifactId: string };

const ArtifactDetail: React.FC<Props> = ({ artifactId }) => {
  const history = useHistory();
  const { data, isLoading, error } =
    Hooks.Models.Artifacts.useGetModelArtifact(artifactId);

  const artifact = data?.result as any;

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader tag="h5">Artifact Details</CardHeader>
        <CardBody>
          <QueryWrapper isLoading={isLoading} error={error}>
            {!artifact ? (
              <p>Artifact not found.</p>
            ) : (
              <Table bordered responsive size="sm">
                <tbody>
                  <tr>
                    <th style={{ width: '240px' }}>Artifact ID</th>
                    <td>{artifact.id}</td>
                  </tr>
                  <tr>
                    <th>Artifact Type</th>
                    <td>{artifact.artifact_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Created</th>
                    <td>{artifact.created_at}</td>
                  </tr>
                  <tr>
                    <th>Last Modified</th>
                    <td>{artifact.last_modified}</td>
                  </tr>
                  {artifact.path && (
                    <tr>
                      <th>Path</th>
                      <td>{artifact.path}</td>
                    </tr>
                  )}
                  {artifact.size && (
                    <tr>
                      <th>Size</th>
                      <td>{artifact.size}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Metadata</th>
                    <td>
                      <pre className="mb-0">
                        {artifact.metadata
                          ? JSON.stringify(artifact.metadata, null, 2)
                          : 'N/A'}
                      </pre>
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </QueryWrapper>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button
          color="secondary"
          onClick={() => history.push('/ml-hub/artifacts')}
        >
          ← Back to Artifacts
        </Button>
      </div>
    </div>
  );
};

export default ArtifactDetail;
