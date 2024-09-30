import React from 'react';
import { Help, HelpSection } from '@tapis/tapisui-common';

const GroupsHelp: React.FC = () => {
  return (
    <Help title="Groups">
      <HelpSection>
        Groups are collections of users that have access Tapis Workflows objects
        such as <b>Pipelines</b> and <b>Secrets</b>.
      </HelpSection>
    </Help>
  );
};

export default GroupsHelp;
