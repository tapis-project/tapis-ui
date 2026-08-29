import { useSyncExternalStore, useState, useCallback } from 'react';
import { Agent, AgentLiveness, getAgentEndpoints } from '../types/agent';
import { INITIAL_AGENTS } from '../data/mockData';

// In-memory state store for agents
let currentAgents: Agent[] = [...INITIAL_AGENTS];
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

const getSnapshot = () => currentAgents;

export interface ProbeResult {
  success: boolean;
  latency: number;
  message: string;
}

export interface UseListAgentsResult {
  agents: Agent[];
  data: Agent[];
  isLoading: boolean;
  isRefreshing: boolean;
  toggleLiveness: (agentId: string) => Agent | null;
  probeAgent: (agentId: string) => ProbeResult;
  refreshAll: () => Promise<void>;
  registerAgent: (newAgent: Agent) => void;
  getAgentById: (id: string) => Agent | undefined;
}

export const useListAgents = (): UseListAgentsResult => {
  const agents = useSyncExternalStore(subscribe, getSnapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleLiveness = useCallback((agentId: string): Agent | null => {
    let updatedAgent: Agent | null = null;
    currentAgents = currentAgents.map((a) => {
      if (a.id === agentId) {
        const nextLiveness =
          a.liveness === AgentLiveness.Alive
            ? AgentLiveness.Dead
            : AgentLiveness.Alive;
        const updated: Agent = {
          ...a,
          liveness: nextLiveness,
          last_modified: new Date().toISOString(),
          consecutive_missed_heartbeats:
            nextLiveness === AgentLiveness.Dead ? 3 : 0,
          last_missed_heartbeat:
            nextLiveness === AgentLiveness.Dead
              ? new Date().toISOString()
              : null,
        };
        updatedAgent = updated;
        return updated;
      }
      return a;
    });
    notifyListeners();
    return updatedAgent;
  }, []);

  const probeAgent = useCallback((agentId: string): ProbeResult => {
    const target = currentAgents.find((a) => a.id === agentId);
    if (!target) {
      return {
        success: false,
        latency: 0,
        message: 'Agent not found.',
      };
    }

    const allEndpoints = getAgentEndpoints(target);
    const probeEndpoint = allEndpoints.find((ep) => ep.liveness_probe);
    const simulatedLatency = Math.floor(Math.random() * 45) + 15;

    if (target.liveness === AgentLiveness.Alive) {
      currentAgents = currentAgents.map((a) =>
        a.id === agentId
          ? {
              ...a,
              consecutive_missed_heartbeats: 0,
            }
          : a
      );
      notifyListeners();
      return {
        success: true,
        latency: simulatedLatency,
        message: `Probe HTTP 200 OK: ${target.name} [${
          probeEndpoint?.liveness_probe?.route || '/healthz'
        }] replied in ${simulatedLatency}ms.`,
      };
    } else {
      currentAgents = currentAgents.map((a) =>
        a.id === agentId
          ? {
              ...a,
              consecutive_missed_heartbeats:
                (a.consecutive_missed_heartbeats || 0) + 1,
              last_missed_heartbeat: new Date().toISOString(),
            }
          : a
      );
      notifyListeners();
      return {
        success: false,
        latency: simulatedLatency,
        message: `Probe FAILED (Connection Refused): ${target.name} is unreachable. Missed heartbeat incremented.`,
      };
    }
  }, []);

  const refreshAll = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    currentAgents = currentAgents.map((a) => {
      if (a.liveness === AgentLiveness.Alive) {
        return {
          ...a,
          consecutive_missed_heartbeats: 0,
        };
      }
      return a;
    });
    notifyListeners();
    setIsRefreshing(false);
  }, []);

  const registerAgent = useCallback((newAgent: Agent) => {
    currentAgents = [newAgent, ...currentAgents];
    notifyListeners();
  }, []);

  const getAgentById = useCallback((id: string) => {
    return currentAgents.find((a) => a.id === id);
  }, []);

  return {
    agents,
    data: agents,
    isLoading: false,
    isRefreshing,
    toggleLiveness,
    probeAgent,
    refreshAll,
    registerAgent,
    getAgentById,
  };
};

export default useListAgents;
