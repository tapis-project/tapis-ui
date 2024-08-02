import React, { useState } from 'react';
import { Datasets } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Button } from 'reactstrap';
import styles from './DatasetDetails.module.scss';
import { Icon, JSONDisplay, GenericModal } from '@tapis/tapisui-common';

type DatasetDetailsProps = {
  datasetId: string;
};

const DatasetDetails: React.FC<DatasetDetailsProps> = ({ datasetId }) => {
  const { data, isLoading, error } = Hooks.Datasets.useDetails({ datasetId });
  const dataset: Datasets.DatasetFullInfo = data?.result ?? {};
  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['dataset-details']}
    >
      <div className={`${styles['dataset-title-container']}`}>
        <div className={`${styles['dataset-title']}`}>
          <b>{datasetId}</b>
        </div>
      </div>
      <div className={`${styles['dataset-details-wrapper']}`}>
        <div className={`${styles['dataset-details']}`}>
          {dataset.author && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>author:</div>
              <div className={`${styles['dataset-info']}`}>
                {dataset.author}
              </div>
            </div>
          )}

          {dataset.downloads && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>downloads:</div>
              <div className={`${styles['detail-info']}`}>
                {dataset.downloads}
              </div>
            </div>
          )}

          {dataset.created_at && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>created_at:</div>
              <div className={`${styles['detail-info']}`}>
                {dataset.created_at}
              </div>
            </div>
          )}

          {dataset.last_modified && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>last_modified:</div>
              <div className={`${styles['detail-info']}`}>
                {dataset.last_modified}
              </div>
            </div>
          )}

          {dataset.tags && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>tags:</div>
              <div className={`${styles['detail-info']}`}>{dataset.tags}</div>
            </div>
          )}

          {dataset.sha && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>sha:</div>
              <div className={`${styles['detail-info']}`}>{dataset.sha}</div>
            </div>
          )}

          {dataset.repository_content && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>
                repository_content:
              </div>

              <div className={`${styles['detail-info']}`}>
                {dataset.repository_content && (
                  <JSONDisplay json={dataset.repository_content}></JSONDisplay>
                )}
              </div>
            </div>
          )}

          {dataset.description && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>description:</div>
              <div className={`${styles['detail-info']}`}>
                {dataset.description}
              </div>
            </div>
          )}

          {dataset.paperswithcode_id && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>
                paperswithcode_id:
              </div>
              <div className={`${styles['detail-info']}`}>
                {dataset.paperswithcode_id}
              </div>
            </div>
          )}

          {dataset.citation && (
            <div className={`${styles['dataset-detail']}`}>
              <div className={`${styles['dataset-title']}`}>citation:</div>
              <div className={`${styles['detail-info']}`}>
                {dataset.citation}
              </div>
            </div>
          )}
        </div>
        <Buttons datasetId={datasetId} />
      </div>
    </QueryWrapper>
  );
};

const Buttons: React.FC<{ datasetId: string }> = ({ datasetId }) => {
  const [currentDataset, setCurrentDataset] = useState<string | undefined>(
    undefined
  );

  const { data, error, isLoading } = Hooks.Datasets.useDetails({ datasetId });

  const datasetCardDetails: Datasets.DatasetFullInfo = data?.result ?? {};

  const {
    data: downloadLinkData,
    error: downloadLinkError,
    isLoading: downloadLinkIsLoading,
  } = Hooks.Datasets.useDownloadLinks({ datasetId });

  const downloadLinkInfo: Datasets.DatasetDownloadInfo =
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

  return (
    <div className={`${styles['buttons-container']}`}>
      <Button
        onClick={() => {
          setCurrentDataset('downloaddataset');
        }}
      >
        {'Download Dataset '}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>

      <Button
        onClick={() => {
          setCurrentDataset('datasetcard');
        }}
      >
        {'Dataset Card '}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>

      {currentDataset === 'datasetcard' && (
        <GenericModal
          toggle={() => {
            setCurrentDataset(undefined);
          }}
          title="Dataset Card"
          body={
            <div>
              {datasetId}
              {datasetCardDetails.card_data && (
                <JSONDisplay json={datasetCardDetails.card_data} />
              )}
            </div>
          }
        />
      )}

      {currentDataset === 'downloaddataset' && (
        <GenericModal
          toggle={() => {
            setCurrentDataset(undefined);
          }}
          title="Download Dataset"
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

export default DatasetDetails;
