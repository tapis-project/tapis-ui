import React from 'react';
import { Models } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/ml-hub/models';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './ModelsDetails.module.scss';

type ModelsProps = {
    modelId: string
}

const ModelDetails: React.FC<ModelsProps> = ({modelId}) => {
    const { data, isLoading, error } = useDetails({modelId});
    const model: Models.ModelShortInfo = data?.result ?? {};
    return (
        <QueryWrapper isLoading={isLoading} error={error}>
            <div>
                {modelId}
            </div>
        </QueryWrapper>
    )
}

