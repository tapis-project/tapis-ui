import React from 'react';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { JSONDisplay } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Link, useRouteMatch } from 'react-router-dom';
import styles from './InferenceServerInfo.module.scss';

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

  const { path } = useRouteMatch();

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
    const { message, metadata, result, status, version } = serverInfo;

    if (
      parseInt(serverInfo.status!) === 200 ||
      parseInt(serverInfo.status!) === 422
    ) {
      return (
        <QueryWrapper isLoading={isLoading} error={error}>
          <div className={`${styles['model-title-container']}`}>
            <div className={`${styles['model-title']}`}></div>
          </div>
          <div className={`${styles['model-details-wrapper']}`}>
            <div className={`${styles['model-details']}`}>
              {parseInt(serverInfo.status!) === 200 && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    availability:
                  </div>
                  <div className={`${styles['detail-info']}`}>Available</div>
                </div>
              )}
              {serverInfo.result?.inference_endpoint && (
                <div className={`${styles['model-detail']}`}>
                  <div className={`${styles['detail-title']}`}>
                    inference_endpoint:
                  </div>
                  <div className={`${styles['detail-info']}`}>
                    <span>
                      <Link
                        to={`${path}/${serverInfo.result.inference_endpoint}`}
                      >
                        {' '}
                        {serverInfo.result.inference_endpoint}{' '}
                      </Link>
                    </span>
                  </div>
                </div>
              )}
              {parseInt(serverInfo.status!) === 422 && (
                <>
                  <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                      availability:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                      {serverInfo.message}
                    </div>
                  </div>
                  <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                      inference_server_possible:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                      {!!serverInfo.result?.inference_server_possible === false
                        ? 'false'
                        : 'true'}
                    </div>
                  </div>
                </>
              )}
              <div className={`${styles['model-detail']}`}>
                <div className={`${styles['detail-title']}`}>model_id:</div>
                <div className={`${styles['detail-info']}`}>
                  {serverInfo.result && serverInfo.result.model_id}
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
    } else {
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
                  Model server is not running. We are unable to provision a
                  server for {modelId}
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
