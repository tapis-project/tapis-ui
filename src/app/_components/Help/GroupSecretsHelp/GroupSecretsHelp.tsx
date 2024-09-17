import React from 'react';
import { Help, HelpSection } from '@tapis/tapisui-common';
import { Alert, AlertTitle } from '@mui/material';

const GroupSecretsHelp: React.FC = () => {
  return (
    <Help title="Group Secrets">
      <HelpSection>
        Group Secrets are user secrets that have been loaned to a group by the
        secret owner for use in pipeline tasks.
        <Alert severity="warning" style={{ marginTop: '8px' }}>
          <AlertTitle>Warning: Use secrets responsibly</AlertTitle>
          The data of a group secret is accessible inside of any task that
          references it in its input. Do not add users to a group that you do
          not trust with that secrets entrusted to that group.
        </Alert>
      </HelpSection>
      <HelpSection title="Secret revocation">
        Owners of a secret can revoke a group's access to a secret at any time.
        This will very likely cause a task that uses this pipeline to fail
        during task execution.
      </HelpSection>
    </Help>
  );
};

export default GroupSecretsHelp;
