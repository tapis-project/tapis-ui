import { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Box, Snackbar, Alert } from '@mui/material';
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
import { AgentControlPlaneTheme } from './uiTokens';

export const AgentControlPlane = () => {
  const { navigate } = useNavigate();
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

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = (
    message: string,
    severity: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

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
      showToast(
        `Agent "${updated.name}" state updated to ${updated.liveness}.`,
        updated.liveness === AgentLiveness.Alive ? 'success' : 'warning'
      );
    }
  };

  // Probe single agent
  const handleProbeAgent = (agentId: string) => {
    const result = probeAgent(agentId);
    showToast(result.message, result.success ? 'success' : 'error');
  };

  // Fleet wide probe refresh
  const handleRefreshAll = () => {
    showToast(
      'Initiating asynchronous fleet liveness probe sweep across all target endpoints...',
      'info'
    );
    refreshAll().then(() => {
      showToast(
        'Fleet probe sweep complete. All alive instances verified healthy.',
        'success'
      );
    });
  };

  // Register a new agent
  const handleRegisterAgent = (newAgent: Agent) => {
    registerAgent(newAgent);
    setIsRegisterOpen(false);
    setRecordToInstantiate(null);
    showToast(
      `Agent "${newAgent.name}" successfully registered & deployed!`,
      'success'
    );
    navigate('/agent-control-plane/agents');
  };

  // Create a new blueprint record
  const handleCreateRecord = (newRecord: AgentRecord) => {
    createRecord(newRecord);
    setIsCreateRecordOpen(false);
    showToast(
      `Agent Record "${newRecord.name}" (v${newRecord.version}) successfully published to registry!`,
      'success'
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
            <Redirect to="/mlhub/agent-control-plane/overview" />
          </Route>
          <Route exact path="/mlhub/agent-control-plane/overview">
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

        {/* Feedback Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%', boxShadow: '0 4px 14px rgba(0,0,0,0.5)' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AgentControlPlaneTheme>
  );
};

export default AgentControlPlane;
