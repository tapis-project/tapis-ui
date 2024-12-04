import React, { useState } from 'react';
import { Models } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Button } from 'reactstrap';
import styles from './ModelDetails.module.scss';
import { Icon, JSONDisplay, GenericModal } from '@tapis/tapisui-common';
import InferenceServerInfo from './InferenceServerInfo';
import Markdown from 'markdown-to-jsx';

type ModelDetailsProps = {
  modelId: string;
};

type MarkdownProps = {
  children: string;
};

const ModelDetails: React.FC<ModelDetailsProps> = ({ modelId }) => {
  const { data, isLoading, error } = Hooks.Models.useDetails({ modelId });
  const model: Models.ModelFullInfo = data?.result ?? {};
  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['model-details']}
    >
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
              {model.repository_content && (
                <JSONDisplay json={model.repository_content}></JSONDisplay>
              )}
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
              {model.transformers_info && (
                <JSONDisplay json={model.transformers_info}></JSONDisplay>
              )}
            </div>
          </div>
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>config:</div>
            <div className={`${styles['detail-info']}`}>
              {model.config && <JSONDisplay json={model.config}></JSONDisplay>}
            </div>
          </div>
        </div>
        <Buttons model={model} />
      </div>
    </QueryWrapper>
  );
};

const Buttons: React.FC<{ model: Models.ModelFullInfo }> = ({ model }) => {
  const [currentModal, setCurrentModal] = useState<string | undefined>(
    undefined
  );
  const {
    data: downloadLinkData,
    error: downloadLinkError,
    isLoading: downloadLinkIsLoading,
  } = Hooks.Models.useDownloadLinks({ modelId: model.model_id! });
  const downloadLinkInfo: Models.ModelDownloadInfo =
    downloadLinkData?.result ?? {};
  const downloadOnClick = (url: string, filename: string) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        let alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = filename;
        document.body.appendChild(alink);
        alink.click();
        document.body.removeChild(alink);

        window.URL.revokeObjectURL(fileURL);
      });
    });
  };

  const {
    data: data2,
    isError,
    error,
  } = Hooks.Models.useModelCardDetails({
    modelId: model.model_id!,
  });

  return (
    <div className={`${styles['buttons-container']}`}>
      <Button
        onClick={() => {
          setCurrentModal('inferenceinfo');
        }}
      >
        {'Inference Service Info '}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal('downloadmodel');
        }}
      >
        {'Download Model '}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal('modelcard');
        }}
      >
        {'Model Card '}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      {currentModal === 'modelcard' && (
        <GenericModal
          size="lg"
          scrollable
          className={`${styles['modal']}`}
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Model Card"
          body={
            <div>
              {isError && error.message}
              {data2?.result?.model_card === undefined ? (
                'no content available'
              ) : (
                <Markdown>{data2?.result?.model_card}</Markdown>
              )}
            </div>
          }
        />
      )}
      {currentModal === 'inferenceinfo' && (
        <GenericModal
          size="lg"
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Inference Info"
          body={
            <div>
              {model.model_id}
              <InferenceServerInfo modelId={model.model_id!} />
            </div>
          }
        />
      )}
      {currentModal === 'downloadmodel' && (
        <GenericModal
          size="lg"
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Download Model"
          body={
            <div className={`${styles['download-body']}`}>
              {downloadLinkInfo?.download_links &&
                Object.entries(downloadLinkInfo.download_links).map(
                  ([filename, url]) => {
                    return (
                      <div className={`${styles['download-links']}`}>
                        <div>{filename}:</div>
                        <div></div>
                        <div className={`${styles['download-url-button']}`}>
                          <Button
                            onClick={() => downloadOnClick(url, filename)}
                          >
                            {' '}
                            Download{' '}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          }
        />
      )}
    </div>
  );
};

export default ModelDetails;
