import React from 'react';
import { Models } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/ml-hub/models';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Button } from 'reactstrap';
import styles from './ModelDetails.module.scss';
import { Icon } from 'tapis-ui/_common';
import { JSONDisplay } from 'tapis-ui/_common';

type ModelsProps = {
    modelId: string
}

type ButtonNames = {
    InferenceServerDetails: String;
    ModelCard: String;
    DownloadModel: String;
}

const ModelDetails: React.FC<ModelsProps> = ({modelId}) => {
    const { data, isLoading, error } = useDetails({modelId});
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
                    <div className={`${styles['detail-title']}`}>
                        author: 
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        {model.author} 
                    </div>
                </div>
                <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                        downloads:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        {model.downloads}
                    </div>
                </div>
                <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                        created_at:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        {model.created_at}
                    </div>
                </div>
                <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                        last_modified:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        {model.last_modified}
                    </div>
                </div>
                <div className={`${styles['model-detail']}`}>
                    <div className={`${styles['detail-title']}`}>
                        sha:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        {model.sha}
                    </div>
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
                    <div className={`${styles['detail-title']}`}>
                        library_name:
                    </div>
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
                    <div className={`${styles['detail-title']}`}>
                        config:
                    </div>
                    <div className={`${styles['detail-info']}`}>
                        <JSONDisplay json={model.config}></JSONDisplay> 
                    </div>
                </div>
            </div>
            <Buttons
            InferenceServerDetails="Inference Server Info"
            DownloadModel="Download Model"
            ModelCard="Model Card"
            />
            </div>


        </QueryWrapper>
    )
}

const Buttons: React.FC<ButtonNames> = ({InferenceServerDetails, ModelCard, DownloadModel}) => {
    return (
    <div className={`${styles['buttons-container']}`}>
        <Button>{InferenceServerDetails} <span> <Icon name="push-right" /> </span></Button>
        <Button>{DownloadModel} <span> <Icon name="push-right" /> </span> </Button> 
        <Button>{ModelCard} <span> <Icon name="push-right" /> </span> </Button>
    </div>
    );

}

export default ModelDetails;