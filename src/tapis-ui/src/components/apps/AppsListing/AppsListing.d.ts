import React from 'react';
import { AppsListCallback } from 'tapis-redux/apps/list/types';
import { Config } from 'tapis-redux/types';
import { Apps } from '@tapis/tapis-typescript';
export declare type OnSelectCallback = (app: Apps.TapisApp) => any;
interface AppsListingProps {
    config?: Config;
    onList?: AppsListCallback;
    onSelect?: OnSelectCallback;
}
declare const AppsListing: React.FC<AppsListingProps>;
export default AppsListing;
