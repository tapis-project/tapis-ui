import { useCallback, useState } from 'react';
import type { Persona, SavePersonaResult } from './types';

const STORAGE_KEY = 'platform:persona';

/**
 * Persists a generated persona. Simulates an async write to a backend,
 * and mirrors the result to localStorage so the persona survives reloads.
 */
export function useSavePersona() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [savedPersona, setSavedPersona] = useState<Persona | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Persona) : null;
    } catch {
      return null;
    }
  });

  const save = useCallback(
    async (persona: Persona): Promise<SavePersonaResult> => {
      setSaving(true);
      setError(null);
      try {
        // Simulated network write. Replace with a real API call.
        await new Promise((resolve) => setTimeout(resolve, 900));
        const persistedAt = new Date().toISOString();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
        setSavedPersona(persona);
        return { persona, persistedAt };
      } catch (err) {
        const e =
          err instanceof Error ? err : new Error('Failed to save persona');
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedPersona(null);
  }, []);

  return { save, saving, error, savedPersona, reset };
}
