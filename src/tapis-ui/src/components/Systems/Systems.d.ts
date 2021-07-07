import React from 'react';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { Config } from 'tapis-redux/types';
export declare type OnSelectCallback = (system: TapisSystem) => any;
interface SystemsProps {
    config?: Config;
    onList?: SystemsListCallback;
    onSelect?: OnSelectCallback;
}
declare const Systems: React.FC<SystemsProps>;
export default Systems;
