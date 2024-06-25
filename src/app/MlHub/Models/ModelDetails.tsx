import React, { useState } from 'react';
import { Models } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Button } from 'reactstrap';
import styles from './ModelDetails.module.scss';
<<<<<<< HEAD:src/app/MlHub/Models/ModelDetails.tsx
import { Icon } from '@tapis/tapisui-common';
import { JSONDisplay } from '@tapis/tapisui-common';
=======
import { Icon } from 'tapis-ui/_common';
import { JSONDisplay } from 'tapis-ui/_common';
import GenericModal from 'tapis-ui/_common/GenericModal/GenericModal';
>>>>>>> dev:src/tapis-app/MlHub/Models/ModelDetails.tsx

type ModelDetailsProps = {
  modelId: string;
};

<<<<<<< HEAD:src/app/MlHub/Models/ModelDetails.tsx
type ButtonNames = {
  InferenceServerDetails: String;
  ModelCard: String;
  DownloadModel: String;
};

const ModelDetails: React.FC<ModelsProps> = ({ modelId }) => {
  const { data, isLoading, error } = Hooks.Models.useDetails({ modelId });
=======
const ModelDetails: React.FC<ModelDetailsProps> = ({ modelId }) => {
  const { data, isLoading, error } = useDetails({ modelId });
>>>>>>> dev:src/tapis-app/MlHub/Models/ModelDetails.tsx
  const model: Models.ModelFullInfo = data?.result ?? {};
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div className={`${styles['model-title-container']}`}>
        <div className={`${styles['model-title']}`}>
          <b>{modelId}</b>
        </div>
      </div>
      <div className={`${styles['model-details-wrapper']}`}>
        <div className={`${styles['model-details']}`}>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>author:</div>
            <div className={`${styles['detail-info']}`}>{model.author}</div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>downloads:</div>
            <div className={`${styles['detail-info']}`}>{model.downloads}</div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>created_at:</div>
            <div className={`${styles['detail-info']}`}>{model.created_at}</div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>last_modified:</div>
            <div className={`${styles['detail-info']}`}>
              {model.last_modified}
            </div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>sha:</div>
            <div className={`${styles['detail-info']}`}>{model.sha}</div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>
              repository_content:
            </div>
            <div className={`${styles['detail-info']}`}>
              <JSONDisplay json={model.repository_content}></JSONDisplay>
            </div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>library_name:</div>
            <div className={`${styles['detail-info']}`}>
              {model.library_name}
            </div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>
              transformers_info:
            </div>
            <div className={`${styles['detail-info']}`}>
              <JSONDisplay json={model.transformers_info}></JSONDisplay>
            </div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>config:</div>
            <div className={`${styles['detail-info']}`}>
              <JSONDisplay json={model.config}></JSONDisplay>
            </div>
          </div>
        </div>
        <Buttons modelId={modelId} />
      </div>
    </QueryWrapper>
  );
};

const Buttons: React.FC<{ modelId: string }> = ({ modelId }) => {
  const [currentModal, setCurrentModal] = useState<string | undefined>(
    undefined
  );
  const { data } = useDetails({ modelId });
  const modelCardDetails: Models.ModelFullInfo = data?.result ?? {};
  return (
    <div className={`${styles['buttons-container']}`}>
      <Button
        onClick={() => {
          setCurrentModal('inferenceinfo');
        }}
      >
        {'Inference Service Info'}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal('downloadmodel');
        }}
      >
        {'Download Model'}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal('modelcard');
        }}
      >
        {'Model Card'}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      {currentModal === 'modelcard' && (
        <GenericModal
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Model Card"
          body={
            <div>
              {modelId}
              <JSONDisplay json={modelCardDetails.card_data}> </JSONDisplay>
            </div>
          }
        />
      )}
      {currentModal === 'inferenceinfo' && (
        <GenericModal
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Inference Info"
          body={<div>INFERENCE INFO</div>}
        />
      )}
      {currentModal === 'downloadmodel' && (
        <GenericModal
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Download Model"
          body={<div>"DOWNLOAD ME"</div>}
        />
      )}
    </div>
  );
};

export default ModelDetails;
