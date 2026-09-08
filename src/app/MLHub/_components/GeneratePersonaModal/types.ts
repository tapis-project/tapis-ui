export type ProfessionKey =
  | 'ai-ml-researcher'
  | 'ml-engineer'
  | 'data-engineer'
  | 'software-engineer'
  | 'research-software-engineer'
  | 'data-scientist'
  | 'platform-mlops'
  | 'educator'
  | 'other-technical';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PersonaAnswers {
  profession: ProfessionKey | '';
  /** Day-to-day workflows the user wants the platform to support. */
  workflows: string[];
  experienceLevel: ExperienceLevel;
}

export interface PersonaPreference {
  key: string;
  label: string;
  value: string;
}

/** A module in the user's curated workspace view. */
export interface WorkspaceModule {
  key: string;
  label: string;
  description: string;
}

export interface Persona {
  id: string;
  createdAt: string;
  profession: ProfessionKey;
  archetype: string;
  tagline: string;
  answers: PersonaAnswers;
  /** How the platform view is curated for this persona. */
  workspace: WorkspaceModule[];
  preferences: PersonaPreference[];
}

export interface SavePersonaResult {
  persona: Persona;
  persistedAt: string;
}
