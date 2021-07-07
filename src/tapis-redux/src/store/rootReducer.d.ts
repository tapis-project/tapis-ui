declare const rootReducer: import("redux").Reducer<import("redux").CombinedState<{
    authenticator: import("../authenticator/types").AuthenticatorState;
    systems: import("../systems/types").SystemsReducerState;
    files: import("../files/types").FilesReducerState;
    apps: import("../apps/types").AppsReducerState;
    jobs: import("../jobs/types").JobsReducerState;
}>, import("redux").AnyAction>;
export declare type TapisState = ReturnType<typeof rootReducer>;
export default rootReducer;
