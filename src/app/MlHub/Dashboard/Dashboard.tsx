import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import FolderIcon from '@mui/icons-material/Folder';
import { StatCard, Section } from '../_components';
import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import styles from './Dashboard.module.scss';
import { ChatContext } from 'app/_context/chat';
import { useHistory } from 'react-router-dom';
import { Download, SmartToy, Upload } from '@mui/icons-material';
import { ModelStatCard } from '../Model/_components';
import { useTapisConfig } from '@tapis/tapisui-hooks';

const Dashboard: React.FC = () => {
  const chatContextValue = useContext(ChatContext);
  const history = useHistory();
  const { username } = useTapisConfig();

  return (
    <div id="mlhub-dashboard">
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          {/* <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Overview of models and datasets across collections
            </Typography>
          </Paper> */}

          {/* Models Section */}
          <Section title="Models" icon={<SmartToy />}>
            <ModelStatCard author={username} />
            <StatCard
              icon={<BusinessIcon />}
              label="Available"
              count={12}
              color="warning.main"
              onClick={() => {
                history.push('/mlhub/models');
              }}
            />
            <StatCard
              icon={<PublicIcon />}
              label="Global"
              count={'~ 670k'}
              color="success.main"
            />
            <StatCard
              icon={<Download />}
              label="Ingestions"
              count={47}
              color="success.main"
            />
            <StatCard
              icon={<Upload />}
              label="Publications"
              count={47}
              color="success.main"
            />
          </Section>

          {/* Datasets Section */}
          {/* <Section title="Datasets">
            <StatCard
              icon={<FolderIcon />}
              label="Private"
              count={8}
              color="info.main"
            />
            <StatCard
              icon={<BusinessIcon />}
              label="Tenant"
              count={23}
              color="warning.main"
            />
            <StatCard
              icon={<PublicIcon />}
              label="Global"
              count={156}
              color="success.main"
            />
          </Section> */}
        </Container>
      </Box>
    </div>
  );
};

export default Dashboard;
