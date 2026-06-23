import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

export const WorkflowQAAgent = createRAGQAAgent({
  id: 'workflow-qa',
  name: 'Workflow QA Agent',
  description: 'Answers questions about Tapis Workflows',
  domain: 'Workflows',
  scopeDescription: 'create, configure, and execute workflows in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/workflows.html',
});

export default WorkflowQAAgent;
