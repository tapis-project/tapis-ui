declare const tapisReduxStore: {
    authenticator: {
        token: {
            token: string;
            expires_at: string;
            expires_in: number;
            jti: string;
        };
        loading: boolean;
        error: any;
    };
    systems: {
        systems: {
            results: import("@tapis/tapis-typescript-systems").TapisSystem[];
            offset: number;
            limit: number;
            loading: boolean;
            error: any;
        };
    };
    files: import("../src/tapis-redux/src/files/types").FilesReducerState;
    apps: import("../src/tapis-redux/src/apps/types").AppsReducerState;
    jobs: import("../src/tapis-redux/src/jobs/types").JobsReducerState;
};
export default tapisReduxStore;
