import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

export const PodQAAgent = createRAGQAAgent({
  id: 'pod-qa',
  name: 'Pod QA Agent',
  description: 'Answers questions about Tapis Pods',
  domain: 'Pods',
  scopeDescription: 'create, configure, and manage Kubernetes pods in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/pods.html',
});

export default PodQAAgent;
