import React from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

const ArtifactsList: React.FC = () => {
  const history = useHistory();
  const { data, isLoading, error } =
    Hooks.Models.Artifacts.useListModelArtifacts();

  const artifacts = data?.result || [];

  const handleClick = (artifactId: string) => {
    history.push(`/ml-hub/artifacts/${artifactId}`);
  };

  return (
    <div className="p-3 p-md-4">
      <h2 className="mb-3">Model Artifacts</h2>

      <Card>
        <CardHeader tag="h5">All Artifacts</CardHeader>
        <CardBody>
          <p className="text-muted mb-3">
            Click a row to view artifact details.
          </p>
          <QueryWrapper isLoading={isLoading} error={error}>
            {artifacts.length === 0 ? (
              <p>No artifacts found.</p>
            ) : (
              <Table striped responsive hover bordered size="sm">
                <thead>
                  <tr>
                    <th>Artifact ID</th>
                    <th>Artifact Type</th>
                    <th>Metadata</th>
                    <th>Created</th>
                    <th>Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {artifacts.map((artifact: any) => (
                    <tr
                      key={artifact.id}
                      className="cursor-pointer"
                      onClick={() => handleClick(artifact.id)}
                    >
                      <td>{artifact.id}</td>
                      <td>{artifact.artifact_type || 'N/A'}</td>
                      <td>
                        <code>
                          {(artifact?.metadata
                            ? JSON.stringify(artifact.metadata)
                            : 'N/A'
                          ).slice(0, 120)}
                          {artifact?.metadata &&
                          JSON.stringify(artifact.metadata).length > 120
                            ? '…'
                            : ''}
                        </code>
                      </td>
                      <td>{artifact.created_at}</td>
                      <td>{artifact.last_modified}</td>
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

export default ArtifactsList;
