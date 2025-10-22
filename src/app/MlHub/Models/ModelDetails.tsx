import React from 'react';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper, JSONDisplay, Icon } from '@tapis/tapisui-common';
import { Card, CardBody, CardHeader, Badge, Row, Col } from 'reactstrap';
import styles from './ModelDetails.module.scss';

type ModelDetailsProps = {
  modelId: string;
  platform?: string;
};

// Map UI keys to API enum values
const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
  HuggingFace: 'huggingface',
  Github: 'github',
  Git: 'git',
  Patra: 'patra',
  TaccTapis: 'tacc-tapis',
  s3: 's3',
};

const ModelDetails: React.FC<ModelDetailsProps> = ({ modelId, platform }) => {
  const { data, isLoading, error } =
    Hooks.Models.Platforms.useGetModelByPlatform(
      {
        platform: PLATFORM_KEY_TO_ENUM[platform || ''] || platform || '',
        modelId,
      },
      { enabled: !!platform && !!modelId }
    );

  const model: any = data?.result ?? {};

  const DetailField: React.FC<{
    label: string;
    value: any;
    isLink?: boolean;
  }> = ({ label, value, isLink = false }) => {
    if (!value) return null;

    return (
      <div className="mb-4">
        <div
          className="text-muted small mb-2 text-uppercase fw-semibold"
          style={{ letterSpacing: '0.5px' }}
        >
          {label}
        </div>
        <div className="fw-normal" style={{ fontSize: '0.95rem' }}>
          {isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-none"
              style={{ wordBreak: 'break-all' }}
            >
              {value}
            </a>
          ) : (
            value
          )}
        </div>
      </div>
    );
  };

  const JSONField: React.FC<{ label: string; value: any }> = ({
    label,
    value,
  }) => {
    if (!value) return null;

    return (
      <div className="mb-4">
        <div
          className="text-muted small mb-3 text-uppercase fw-semibold"
          style={{ letterSpacing: '0.5px' }}
        >
          {label}
        </div>
        <div className="bg-light p-3 rounded">
          <JSONDisplay json={value} />
        </div>
      </div>
    );
  };

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['model-details-page']}
    >
      <div className="container-fluid px-4 py-4">
        {/* Header Section */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h2 className="mb-0">{model.name || modelId}</h2>
            {platform && (
              <Badge
                color={platform === 'HuggingFace' ? 'primary' : 'info'}
                className="px-2"
                style={{ fontSize: '0.75rem', marginLeft: '4px' }}
              >
                {platform}
              </Badge>
            )}
            {model.version && (
              <Badge
                color="secondary"
                className="px-2"
                style={{ fontSize: '0.75rem', marginLeft: '4px' }}
              >
                v{model.version}
              </Badge>
            )}
          </div>
          {model.short_description && (
            <p className="text-muted mb-0 fs-5 mt-2">
              {model.short_description}
            </p>
          )}
        </div>

        <Row className="g-4">
          <Col md={12}>
            {/* Overview Card */}
            <Card className="mb-4 shadow-sm border-0">
              <CardHeader className="bg-light border-0 py-3 px-4">
                <h5 className="mb-0 d-flex align-items-center">
                  <span style={{ marginRight: '8px', display: 'inline-flex' }}>
                    <Icon name="data-files" />
                  </span>
                  Overview
                </h5>
              </CardHeader>
              <CardBody className="p-4">
                <Row>
                  <Col md={6}>
                    <DetailField
                      label="Model ID"
                      value={model.mc_id || model._id}
                    />
                    <DetailField label="Name" value={model.name} />
                    <DetailField label="Author" value={model.author} />
                    <DetailField
                      label="External ID"
                      value={model.external_id}
                    />
                  </Col>
                  <Col md={6}>
                    <DetailField label="Version" value={model.version} />
                    <DetailField label="Library" value={model.library_name} />
                    <DetailField label="Input Type" value={model.input_type} />
                    <DetailField label="Categories" value={model.categories} />
                  </Col>
                </Row>

                {model.full_description && (
                  <div className="mt-4 pt-4 border-top">
                    <div className="text-muted small mb-2 text-uppercase fw-semibold">
                      Full Description
                    </div>
                    <p className="mb-0 lh-lg">{model.full_description}</p>
                  </div>
                )}

                {model.keywords && (
                  <div className="mt-4 pt-4 border-top">
                    <div className="text-muted small mb-2 text-uppercase fw-semibold">
                      Keywords
                    </div>
                    <div className="lh-lg">{model.keywords}</div>
                  </div>
                )}

                {(model.input_data ||
                  model.output_data ||
                  model.repository_content) && (
                  <div className="mt-4 pt-4 border-top">
                    <div className="text-muted small mb-3 text-uppercase fw-semibold">
                      Resources
                    </div>
                    <DetailField
                      label="Input Data"
                      value={model.input_data}
                      isLink
                    />
                    <DetailField
                      label="Output Data"
                      value={model.output_data}
                      isLink
                    />
                    <JSONField
                      label="Repository Content"
                      value={model.repository_content}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Technical Details Card */}
            {(model.config ||
              model.transformers_info ||
              model.ai_model ||
              model.sha) && (
              <Card className="mb-4 shadow-sm border-0">
                <CardHeader className="bg-light border-0 py-3 px-4">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span
                      style={{ marginRight: '8px', display: 'inline-flex' }}
                    >
                      <Icon name="code" />
                    </span>
                    Technical Details
                  </h5>
                </CardHeader>
                <CardBody className="p-4">
                  <DetailField label="SHA" value={model.sha} />
                  <JSONField label="Configuration" value={model.config} />
                  <JSONField
                    label="Transformers Info"
                    value={model.transformers_info}
                  />
                  <JSONField label="AI Model Details" value={model.ai_model} />
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </QueryWrapper>
  );
};

export default ModelDetails;
