import { createRAGQAAgent } from 'app/_context/chat/createRAGQAAgent';

const systemsListTypeGuidance =
  'Important context about listing systems: The getSystems endpoint supports a `listType` query parameter ' +
  '(type: ListTypeEnum, default: "OWNED"). The possible values are:\n' +
  '- "OWNED" — returns only systems owned by the requester (this is the default).\n' +
  '- "ALL" — returns all systems the requester has access to, including owned systems and those shared with them.\n' +
  '- "SHARED_PUBLIC" — returns only systems that have been shared publicly.\n\n' +
  'When a user asks about seeing all of their systems or all available systems, the correct approach is to use ' +
  'listType=ALL. When they ask about just their own systems, that is the default OWNED behavior. ' +
  'You may briefly note that SHARED_PUBLIC is also available for browsing publicly shared systems, but ' +
  'treat it as a less commonly used option — just a brief aside rather than a primary recommendation.';

export const SystemQAAgent = createRAGQAAgent({
  id: 'system-qa',
  name: 'System QA Agent',
  description: 'Answers questions about Tapis Systems',
  domain: 'Systems',
  scopeDescription: 'create, configure, and manage systems in Tapis',
  docsUrl: 'https://tapis.readthedocs.io/en/latest/technical/systems.html',
  extraInstructions: systemsListTypeGuidance,
});

export default SystemQAAgent;
