import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { SystemList } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';
import { Config } from 'tapis-redux/types';

/* remove config later... */
interface SystemsProps  {
    config?: Config
}

const Systems: React.FC<SystemsProps> = ({config}) => {
    const [selectedSystem, setSelectedSystem] = useState<TapisSystem>(null);
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
                        ? <FileListing systemId={selectedSystem.id} path={'/'} />
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














    // return (
    //     <ListSection>
    //         <ListSectionGroup>
    //             <ListSectionGroupItem>
    //                 <ListSectionHeader>
    //                     <div>
    //                         System List
    //                         &nbsp;
    //                         <span className="btn-head" onClick={refresh}>
    //                             <Icon name="refresh" />
    //                         </span>
    //                     </div>
    //                 </ListSectionHeader>
    //                 <ListSectionGroupItemBody>
                        
    //                     <ListSectionList>
    //                         <SystemList config={config} onSelect={systemSelectCallback} />
    //                     </ListSectionList>
    //                 </ListSectionGroupItemBody>   
    //             </ListSectionGroupItem>
    //             <ListSectionGroupItem>
    //                 <ListSectionHeader>
    //                     <div>
    //                         System List
    //                         &nbsp;
    //                         <span className="btn-head" onClick={refresh}>
    //                             <Icon name="refresh" />
    //                         </span>
    //                     </div>
    //                 </ListSectionHeader>
    //                 <ListSectionGroupItemBody>
                        
    //                     <ListSectionList>
    //                         <SystemList config={config} onSelect={systemSelectCallback} />
    //                     </ListSectionList>

                        
    //                 </ListSectionGroupItemBody>

                    
    //             </ListSectionGroupItem>
    //             <ListSectionGroupItem>
    //                 <ListSectionDetail>
    //                     <ListSectionHeader type={"sub-header"}>Files</ListSectionHeader>
    //                     {selectedSystem
    //                         ? <FileListing systemId={selectedSystem.id} path={'/'} />
    //                         : <SectionMessage type="info">
    //                             Select a system from the list.
    //                             </SectionMessage>
    //                     }
    //                 </ListSectionDetail>
    //             </ListSectionGroupItem>
    //             <ListSectionGroupItem>
    //                 <ListSectionDetail>
    //                     <ListSectionHeader type={"sub-header"}>Files</ListSectionHeader>
    //                     {selectedSystem
    //                         ? <FileListing systemId={selectedSystem.id} path={'/'} />
    //                         : <SectionMessage type="info">
    //                             Select a system from the list.
    //                             </SectionMessage>
    //                     }
    //                 </ListSectionDetail>
    //             </ListSectionGroupItem>
                
    //         </ListSectionGroup>
          
    
    //     </ListSection>

        
    // )
