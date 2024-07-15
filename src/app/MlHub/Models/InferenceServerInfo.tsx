import React, { useState, useEffect } from 'react';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Models, inference } from '@tapis/tapis-typescript';
import { JSONDisplay } from '@tapis/tapisui-common';
import styles from './ModelDetails.module.scss';
import { Icon, GenericModal, QueryWrapper } from '@tapis/tapisui-common';

type InferenceServerInfoProps = {
  modelId: string;
};

const InferenceServerInfo: React.FC<InferenceServerInfoProps> = ({
  modelId,
}) => {
  const {
    data: serverInfo,
    error,
    isError,
    isLoading,
  } = Hooks.Models.useInferenceServerDetails({ modelId });
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (isError) {
    return <p>isError: {isError}</p>;
  }

  if (serverInfo) {
    const { message, metadata, result, transformers_info, status, version } =
      serverInfo;
    // console.log ("serverInfo" , serverInfo)

    if (
      serverInfo.status === 200 ||
      serverInfo.status === 422 ||
      (serverInfo.status === 404 && serverInfo.result !== null)
    ) {
      return (
        <QueryWrapper isLoading={isLoading} error={error}>
          <div className={`${styles['model-title-container']}`}>
            <div className={`${styles['model-title']}`}></div>
          </div>
          <div className={`${styles['model-details-wrapper']}`}>
            <div className={`${styles['model-details']}`}>
              {serverInfo.result?.availability && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    availability:
                  </div>
                  <div className={`${styles['detail-info']}`}>
                    {serverInfo.result.availability}
                  </div>
                </div>
              )}
              {serverInfo.result?.inference_endpoint && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    inference_endpoint:
                  </div>
                  <div className={`${styles['detail-info']}`}>
                    {serverInfo.result.inference_endpoint}
                  </div>
                </div>
              )}
              {serverInfo.result?.inference_server_possible && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    iinference_server_possible:
                  </div>
                  <div className={`${styles['detail-info']}`}>
                    {serverInfo.result.inference_server_possible}
                  </div>
                </div>
              )}
              <div className={`${styles['model-detail']}`}>
                <div className={`${styles['detail-title']}`}>model_id:</div>
                <div className={`${styles['detail-info']}`}>
                  {serverInfo.result.model_id}
                </div>
              </div>
              {serverInfo.result?.prompt_example && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    prompt_example:
                  </div>
                  <div className={`${styles['detail-info']}`}></div>
                  {serverInfo.result.prompt_example && (
                    <JSONDisplay
                      json={serverInfo.result.prompt_example}
                    ></JSONDisplay>
                  )}
                </div>
              )}
              {serverInfo.result?.transformers_info && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    transformers_info:
                  </div>
                  <div className={`${styles['detail-info']}`}></div>
                  {serverInfo.result.transformers_info && (
                    <JSONDisplay
                      json={serverInfo.result.transformers_info}
                    ></JSONDisplay>
                  )}
                </div>
              )}
            </div>
          </div>
        </QueryWrapper>
      );
    } else if (serverInfo.status === 404 && serverInfo.result === null) {
      return (
        <QueryWrapper isLoading={isLoading} error={error}>
          <div className={`${styles['model-title-container']}`}>
            <div className={`${styles['model-title']}`}></div>
          </div>
          <div className={`${styles['model-details-wrapper']}`}>
            <div className={`${styles['model-details']}`}>
              <div className={`${styles['model-detail']}`}>
                <div className={`${styles['detail-title']}`}>message:</div>
                <div className={`${styles['detail-info']}`}>
                  {serverInfo.message}
                </div>
              </div>
            </div>
          </div>
        </QueryWrapper>
      );
    }
  }
  return null;
};

export default InferenceServerInfo;
