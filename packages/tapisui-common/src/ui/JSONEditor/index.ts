// Exports the LAZY wrapper: the barrel this flows into is imported by the
// always-mounted sidebar, so a direct export would drag CodeMirror into the
// eager bundle. See JSONEditorLazy.tsx.
import JSONEditorLazy from './JSONEditorLazy';

export type { JSONEditorProps } from './JSONEditor';
export default JSONEditorLazy;
