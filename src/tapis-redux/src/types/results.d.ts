export declare type TapisListResults<T> = {
    loading: boolean;
    error: Error;
    results: Array<T>;
    offset: number;
    limit: number;
};
export declare const offsetCheck: (offset: number | undefined) => number;
export declare const limitCheck: (limit: number | undefined, defaultLimit: number) => number;
export declare const getEmptyListResults: <T>(defaultLimit: number) => TapisListResults<T>;
export declare const setRequesting: <T>(original: TapisListResults<T>) => TapisListResults<T>;
export declare const setFailure: <T>(original: TapisListResults<T>, error: Error) => TapisListResults<T>;
export declare const updateList: <T>(original: TapisListResults<T>, incoming: T[], offset: number, limit: number, defaultLimit: number) => TapisListResults<T>;
