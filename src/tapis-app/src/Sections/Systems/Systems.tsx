import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux/src';
import { SystemList } from 'tapis-ui/src/components/systems';
import { FileListing } from 'tapis-ui/src/components/files';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SectionMessage, Icon } from 'tapis-ui/src/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/src/Sections/ListSection';
import { Config } from 'tapis-redux/src/types';

/* remove config later... */
interface SystemsProps  {
    config?: Config
}

const Systems: React.FC<SystemsProps> = ({config}) => {
    const [selectedSystem, setSelectedSystem] = useState<TapisSystem | null>(null);
    const { list } = useSystems();
    const dispatch = useDispatch();
    const systemSelectCallback = useCallback(
        (system: TapisSystem) => {
            /* eslint-disable */
            setSelectedSystem(system);
        },
        [setSelectedSystem]
    )
    const refresh = () => {
        setSelectedSystem(null);
        dispatch(list({}));
    }

    return (
        <ListSection>
        <ListSectionHeader>
            <div>
                System List
                &nbsp;
                <span className="btn-head" onClick={refresh}>
                    <Icon name="refresh" />
                </span>
            </div>
        </ListSectionHeader>
        <ListSectionBody>
            <ListSectionList>
                <SystemList config={config} onSelect={systemSelectCallback} />
            </ListSectionList>
            <ListSectionDetail>
                <ListSectionHeader type={"sub-header"}>Files</ListSectionHeader>
                {selectedSystem
                    ? <FileListing systemId={selectedSystem.id || ''} path={'/'} />
                    : <SectionMessage type="info">
                        Select a system from the list.
                        </SectionMessage>
                }
            </ListSectionDetail>
        </ListSectionBody>
        </ListSection>
    )
}

export default Systems;