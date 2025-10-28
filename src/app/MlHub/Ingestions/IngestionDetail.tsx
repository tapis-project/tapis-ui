import React from "react";
import { QueryWrapper } from "@tapis/tapisui-common";
import { MLHub as Hooks } from "@tapis/tapisui-hooks";
import { Card, CardBody } from "reactstrap";

type Props = { ingestionId: string };

const IngestionDetail: React.FC<Props> = ({ ingestionId }) => {
  const { data, isLoading, error } = (Hooks as any).MLHub.Ingestions.useGet(
    ingestionId
  );
  const ingestion = data?.result;
  const status = ingestion?.status as string | undefined;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Card>
        <CardBody>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h4 style={{ margin: 0 }}>Ingestion {ingestionId}</h4>
            {status && <span>{status}</span>}
          </div>
          <div style={{ marginTop: 12 }}>
            <div>
              <b>Platform:</b> {ingestion?.platform}
            </div>
            <div>
              <b>Created:</b> {ingestion?.created_at}
            </div>
            <div>
              <b>Last Modified:</b> {ingestion?.last_modified}
            </div>
            <div>
              <b>Last Message:</b> {ingestion?.last_message}
            </div>
            {ingestion?.artifact_id && (
              <div>
                <b>Artifact ID:</b> {ingestion.artifact_id}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </QueryWrapper>
  );
};

export default IngestionDetail;
