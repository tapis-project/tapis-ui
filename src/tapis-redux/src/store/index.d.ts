declare const configureStore: () => import("redux").Store<import("redux").EmptyObject & {
    authenticator: import("../authenticator/types").AuthenticatorState;
    systems: import("../systems/types").SystemsReducerState;
    files: import("../files/types").FilesReducerState;
    apps: import("../apps/types").AppsReducerState;
    jobs: import("../jobs/types").JobsReducerState;
}, import("redux").AnyAction> & {
    dispatch: unknown;
};
export default configureStore;
