export interface TapisResponse {
    result: any;
    status: string;
    message: string;
    version: string;
}
export declare const isTapisResponse: <T>(obj: Error | T | TapisResponse) => obj is TapisResponse;
