import React from 'react';
import { Workflows } from "@tapis/tapis-typescript"
import { useList } from "tapis-hooks/workflows/archives"
import { SectionMessage } from 'tapis-ui/_common';
import { ArchiveList } from "./_components"

type ArchivesProps = {
  groupId?: string
}

const Archives: React.FC<ArchivesProps> = ({groupId}) => {
  return (
    <div id="archives">
      {groupId ? (
        <div>
          <ArchiveList groupId={groupId}/>
        </div>
      ): (
        <SectionMessage type="info">Select a group</SectionMessage>
      )}
    </div>
  )
};

export default Archives;
