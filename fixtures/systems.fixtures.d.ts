import { Systems } from '@tapis/tapis-typescript';
export declare const tapisSystem: Systems.TapisSystem;
export declare const systemsStore: {
    systems: {
        results: Systems.TapisSystem[];
        offset: number;
        limit: number;
        loading: boolean;
        error: any;
    };
};
