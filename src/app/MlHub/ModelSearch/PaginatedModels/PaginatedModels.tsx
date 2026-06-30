import React, { useMemo } from 'react';
import { Container, Typography } from '@mui/material';
import styles from './NativeModels.module.scss';
import * as Models from '@mlhub/models-ts-sdk';
import { LoadingButton } from '@mui/lab';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { ModelCard } from '../../_components';

type NativeModelsProps = {
  models: Array<Models.ModelMetadata>;
  scope: 'global' | 'tenant';
  count?: number;
  previous?: () => void;
  next?: () => void;
  isLoading?: boolean;
};

const PaginatedModels: React.FC<NativeModelsProps> = ({
  models,
  scope,
  count,
  next,
  previous,
  isLoading,
}) => {
  const appropriateModels = useMemo(() => {
    return models.filter((m) => {
      return (
        !m.keywords?.includes('not-for-all-audiences') &&
        !m.keywords?.includes('roleplay')
      );
    });
  }, [models, count]);

  const renderInappropriateModelsCountComponent = () => {
    let diff = models.length - appropriateModels.length;
    if (diff > 0) {
      return (
        <Typography sx={{ color: '#d32f2f' }}>
          {diff} models hidden for questionable content
        </Typography>
      );
    }
  };

  return (
    <div>
      <div
        style={{
          padding: '16px',
          paddingBottom: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <LoadingButton
            size="small"
            disabled={
              isLoading || previous === undefined || models.length === 0
            }
            loading={isLoading}
            onClick={previous}
            variant="contained"
            style={{ cursor: 'pointer' }}
            startIcon={<MdNavigateBefore />}
          >
            Previous
          </LoadingButton>
          <div></div>
          <LoadingButton
            size="small"
            disabled={isLoading || next === undefined || models.length === 0}
            loading={isLoading}
            onClick={next}
            variant="contained"
            style={{ cursor: 'pointer' }}
            endIcon={<MdNavigateNext />}
          >
            Next
          </LoadingButton>
        </div>
        {!!count && (
          <div>
            Showing <b>{appropriateModels.length}</b> models{' '}
            {renderInappropriateModelsCountComponent()}
          </div>
        )}
      </div>
      <div className={styles['model-card-container']}>
        {models.length === 0 && !isLoading ? (
          <Container maxWidth="md" sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Explore Models
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Discover, deploy, and integrate state-of-the-art open models
              directly into your applications.
            </Typography>
          </Container>
        ) : (
          appropriateModels.map((model) => {
            return <ModelCard model={model} scope={scope} />;
          })
        )}
      </div>
    </div>
  );
};

export default PaginatedModels;
