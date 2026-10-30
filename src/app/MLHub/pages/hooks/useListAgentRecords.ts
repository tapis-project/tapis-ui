import { useSyncExternalStore, useCallback } from 'react';
import { AgentRecord } from '../types/agent';
import { INITIAL_AGENT_RECORDS } from '../data/mockData';

// In-memory state store for agent record blueprints
let currentRecords: AgentRecord[] = [...INITIAL_AGENT_RECORDS];
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => currentRecords;

export interface UseListAgentRecordsResult {
  records: AgentRecord[];
  data: AgentRecord[];
  isLoading: boolean;
  createRecord: (newRecord: AgentRecord) => void;
  getRecordById: (id: string) => AgentRecord | undefined;
}

export const useListAgentRecords = (): UseListAgentRecordsResult => {
  const records = useSyncExternalStore(subscribe, getSnapshot);

  const createRecord = useCallback((newRecord: AgentRecord) => {
    currentRecords = [newRecord, ...currentRecords];
    notifyListeners();
  }, []);

  const getRecordById = useCallback((id: string) => {
    return currentRecords.find((r) => r.id === id);
  }, []);

  return {
    records,
    data: records,
    isLoading: false,
    createRecord,
    getRecordById,
  };
};

export default useListAgentRecords;
