import React from 'react';
import { Help, HelpSection } from '@tapis/tapisui-common';

const SecretsHelp: React.FC = () => {
  return (
    <Help title="Secrets">
      <HelpSection>
        Secrets are a way for users to securely store sensitive information for
        use in various Tapis contexts. Secrets are stored using the Tapis
        Security Kernal (SK) which is powered by HashiCorp Vault
      </HelpSection>
      <HelpSection title="Usage of secrets in Tapis">
        Users in Tapis can grant access to their secrets to Workflow{' '}
        <b>Groups</b>. The secret data can then be referenced in <b>Pipeline</b>{' '}
        defintions and used by Tasks in workflow runs.
      </HelpSection>
    </Help>
  );
};

export default SecretsHelp;
