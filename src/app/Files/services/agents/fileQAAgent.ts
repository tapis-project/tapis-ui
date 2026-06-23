import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

export const FileQAAgent = createRAGQAAgent({
  id: 'file-qa',
  name: 'File QA Agent',
  description: 'Answers questions about Tapis Files',
  domain: 'Files',
  scopeDescription:
    'perform file operations such as listing, uploading, downloading, ' +
    'moving, copying, deleting files, managing file permissions, ' +
    'creating PostIts, and transferring files between systems in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/files.html',
});

export default FileQAAgent;
