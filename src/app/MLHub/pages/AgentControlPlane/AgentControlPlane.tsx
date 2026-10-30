import { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Box } from '@mui/material';
import { Header } from './Header';
import { OverviewPage } from './OverviewPage';
import { AgentsListPage } from './AgentsListPage';
import { AgentRecordsPage } from './AgentRecordsPage';
import { AgentDetailDrawer } from './AgentDetailDrawer';
import { RegisterAgentDialog } from './RegisterAgentDialog';
import { CreateRecordDialog } from './CreateRecordDialog';
import { AgentPlaygroundModal } from './AgentPlaygroundModal';
import { Agent, AgentRecord, AgentLiveness } from '../types/agent';
import { useListAgents } from '../hooks/useListAgents';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { useNavigate } from '../../_context/NavContext';
import { useToast } from '../../_context/ToastsContext/useToast';
import { AgentControlPlaneTheme } from './uiTokens';

export const AgentControlPlane = () => {
  const { navigate } = useNavigate();
  const toast = useToast();
  const {
    toggleLiveness,
    probeAgent,
    registerAgent,
    refreshAll,
    isRefreshing,
  } = useListAgents();
  const { createRecord } = useListAgentRecords();

  // Modals & Drawers state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [playgroundAgent, setPlaygroundAgent] = useState<Agent | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState<boolean>(false);
  const [recordToInstantiate, setRecordToInstantiate] =
    useState<AgentRecord | null>(null);

  // Toggle liveness
  const handleToggleLiveness = (agentId: string) => {
    const updated = toggleLiveness(agentId);
    if (updated) {
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(updated);
      }
      if (playgroundAgent?.id === agentId) {
        setPlaygroundAgent(updated);
      }
      const message = `Agent "${updated.name}" state updated to ${updated.liveness}.`;
      if (updated.liveness === AgentLiveness.Alive) {
        toast.success(message);
      } else {
        toast.warning(message);
      }
    }
  };

  // Probe single agent
  const handleProbeAgent = (agentId: string) => {
    const result = probeAgent(agentId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Fleet wide probe refresh
  const handleRefreshAll = () => {
    toast.info(
      'Initiating asynchronous fleet liveness probe sweep across all target endpoints...'
    );
    refreshAll().then(() => {
      toast.success(
        'Fleet probe sweep complete. All alive instances verified healthy.'
      );
    });
  };

  // Register a new agent
  const handleRegisterAgent = (newAgent: Agent) => {
    registerAgent(newAgent);
    setIsRegisterOpen(false);
    setRecordToInstantiate(null);
    toast.success(
      `Agent "${newAgent.name}" successfully registered & deployed!`
    );
    navigate('/agent-control-plane/agents');
  };

  // Create a new blueprint record
  const handleCreateRecord = (newRecord: AgentRecord) => {
    createRecord(newRecord);
    setIsCreateRecordOpen(false);
    toast.success(
      `Agent Record "${newRecord.name}" (v${newRecord.version}) successfully published to registry!`
    );
    navigate('/agent-control-plane/records');
  };

  // Instantiate from record
  const handleInstantiateRecord = (record: AgentRecord) => {
    setRecordToInstantiate(record);
    setIsRegisterOpen(true);
  };

  return (
    <AgentControlPlaneTheme>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        {/* Top Header */}
        <Header
          onOpenRegisterAgent={() => {
            setRecordToInstantiate(null);
            setIsRegisterOpen(true);
          }}
          onOpenCreateRecord={() => setIsCreateRecordOpen(true)}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshing}
        />
        <Switch>
          <Route exact path="/mlhub/agent-control-plane">
            <OverviewPage
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              onProbeAgent={handleProbeAgent}
              onNavigateToAgents={() => navigate('/agent-control-plane/agents')}
              onNavigateToRecords={() =>
                navigate('/agent-control-plane/records')
              }
            />
          </Route>
          <Route exact path="/mlhub/agent-control-plane/agents">
            <AgentsListPage
              onSelectAgent={(agent) => setSelectedAgent(agent)}
              onOpenRegisterAgent={() => {
                setRecordToInstantiate(null);
                setIsRegisterOpen(true);
              }}
              onToggleLiveness={handleToggleLiveness}
              onProbeAgent={handleProbeAgent}
              onOpenPlayground={(agent) => setPlaygroundAgent(agent)}
            />
          </Route>
          <Route exact path="/mlhub/agent-control-plane/records">
            <AgentRecordsPage
              onInstantiateRecord={handleInstantiateRecord}
              onOpenCreateRecord={() => setIsCreateRecordOpen(true)}
              onSelectRecord={(record) => {
                handleInstantiateRecord(record);
              }}
            />
          </Route>
        </Switch>

        {/* Inspection Drawer */}
        <AgentDetailDrawer
          open={Boolean(selectedAgent)}
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onProbeAgent={handleProbeAgent}
          onToggleLiveness={handleToggleLiveness}
          onOpenPlayground={(agent) => {
            setSelectedAgent(null);
            setPlaygroundAgent(agent);
          }}
        />

        {/* Register Agent Modal */}
        <RegisterAgentDialog
          open={isRegisterOpen}
          onClose={() => {
            setIsRegisterOpen(false);
            setRecordToInstantiate(null);
          }}
          onRegister={handleRegisterAgent}
          initialRecord={recordToInstantiate}
        />

        {/* Create Agent Record Blueprint Modal */}
        <CreateRecordDialog
          open={isCreateRecordOpen}
          onClose={() => setIsCreateRecordOpen(false)}
          onCreateRecord={handleCreateRecord}
        />

        {/* Interactive Agent Console Playground */}
        <AgentPlaygroundModal
          open={Boolean(playgroundAgent)}
          agent={playgroundAgent}
          onClose={() => setPlaygroundAgent(null)}
          onProbeAgent={handleProbeAgent}
        />
      </Box>
    </AgentControlPlaneTheme>
  );
};

export default AgentControlPlane;
