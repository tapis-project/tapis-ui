import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

export const AppQAAgent = createRAGQAAgent({
  id: 'app-qa',
  name: 'App QA Agent',
  description: 'Answers questions about Tapis Apps',
  domain: 'Apps',
  scopeDescription: 'create, configure, and manage applications in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/apps.html',
});

export default AppQAAgent;
