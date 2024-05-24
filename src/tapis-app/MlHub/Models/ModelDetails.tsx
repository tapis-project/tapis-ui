import React from 'react';
import { Models } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/ml-hub/models';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Table } from 'reactstrap';

type ModelsProps = {
    modelId: string
}

const ModelDetails: React.FC<ModelsProps> = ({modelId}) => {
    const { data, isLoading, error } = useDetails({modelId});
    const model: Models.ModelShortInfo = data?.result ?? {};
    return (
        <QueryWrapper isLoading={isLoading} error={error}>
            <Table>
            <div>
                {modelId}

            </div>
            <div>
                author: {model.author}
                downloads: {model.downloads}
                created_at: {model.created_at}
                last_modified: {model.last_modified}
                library_name: {model.library_name}
            </div>
            </Table>
        </QueryWrapper>
    )
}

export default ModelDetails;