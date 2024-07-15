import React, { useState, useEffect } from 'react';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Models } from '@tapis/tapis-typescript';
import { JSONDisplay } from '@tapis/tapisui-common';
import styles from './ModelDetails.module.scss';
import { Icon, GenericModal, QueryWrapper } from '@tapis/tapisui-common';


type InferenceServerInfoProps = {
  modelId: string;
};

const InferenceServerInfo: React.FC<InferenceServerInfoProps> = ({ modelId }) => {
  // const { data: serverInfo, error, isError, isLoading } = (Hooks.Models.useInferenceServerDetails({ modelId }) as HookReturnValues);
  const { data, error, isError, isLoading } = Hooks.Models.useInferenceServerDetails({ modelId });
  const serverInfo = data 
  // console.log ("serverinfo", serverInfo )
  // console.log("type of inference endpoint",(serverInfo && serverInfo.result &&  typeof(serverInfo.result.inference_endpoint)))

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError && error) {
    return <p>Error: {error.message}</p>;
  }

  if (serverInfo && (parseInt(serverInfo.status!) === 200 || parseInt(serverInfo.status!) === 422 )) {
    return (
      <QueryWrapper isLoading={isLoading} error={error}>
        <div className={`${styles['model-title-container']}`}>
          <div className={`${styles['model-title']}`}></div>
        </div>
        <div className={`${styles['model-details-wrapper']}`}>
          <div className={`${styles['model-details']}`}>
          {
          parseInt(serverInfo.status!) === 200 && (
            <div className={`${styles['model-detail']}`}>
              <div className={`${styles['detail-title']}`}>availability:</div>
              <div className={`${styles['detail-info']}`}>Available</div>
            </div>
          )
          }
          {
          parseInt(serverInfo.status!) === 422 && (
            <div className={`${styles['model-detail']}`}>
              <div className={`${styles['detail-title']}`}>availability:</div>
              <div className={`${styles['detail-info']}`}>{serverInfo.message}</div>
            </div>
          )
          }

          {
          serverInfo.result?.inference_endpoint && (
            <div className={`${styles['model-detail']}`}>
              <div className={`${styles['detail-title']}`}>inference_endpoint:</div>
              <div className={`${styles['detail-info']}`}><a href={serverInfo.result.inference_endpoint} target="_blank" rel="noopener noreferrer">
              {serverInfo.result.inference_endpoint}
              </a>
              </div>
            </div>
          )
          }
          {
          serverInfo.result?.inference_server_possible && (
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>inference_server_possible:</div>
            <div className={`${styles['detail-info']}`}>{serverInfo.result.inference_server_possible}</div>
          </div>
          )
          }
          {
          serverInfo.result?.model_id && (
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>model_id:</div>
            <div className={`${styles['detail-info']}`}>{serverInfo.result.model_id}</div>
          </div>
          )
          }            
          {
          serverInfo.result?.prompt_example && (
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>prompt_example:</div>
            <div className={`${styles['detail-info']}`}></div>
            {
              serverInfo.result.prompt_example && (
              <JSONDisplay json={serverInfo.result.prompt_example}></JSONDisplay>
              )
            }
          </div>
          )
          }
          {
          serverInfo.result?.transformers_info && (
          <div className={`${styles['model-detail']}`}>
            <div className={`${styles['detail-title']}`}>transformers_info:</div>
            <div className={`${styles['detail-info']}`}></div>
            {
              serverInfo.result.transformers_info && (
              <JSONDisplay json={serverInfo.result.transformers_info}></JSONDisplay>
              )
            }
          </div>
          )
          }
        </div>
      </div>
      </QueryWrapper>
    );
  }
    else  {
      return (
        <QueryWrapper isLoading={isLoading} error={error}>
          <div className={`${styles['model-title-container']}`}>
            <div className={`${styles['model-title']}`}></div>
          </div>
          <div className={`${styles['model-details-wrapper']}`}>
            <div className={`${styles['model-details']}`}>
              <div className={`${styles['model-detail']}`}>
                <div className={`${styles['detail-title']}`}>message:</div>
                <div className={`${styles['detail-info']}`}>Model server is not running. We are unable to provision a server for {modelId}</div>
              </div>
            </div>
          </div>
        </QueryWrapper>
      );
  }
  return null;
};

export default InferenceServerInfo;
