import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

export const JobQAAgent = createRAGQAAgent({
  id: 'job-qa',
  name: 'Job QA Agent',
  description: 'Answers questions about Tapis Jobs',
  domain: 'Jobs',
  scopeDescription: 'submit, monitor, and manage computational jobs in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/jobs.html',
});

export default JobQAAgent;
