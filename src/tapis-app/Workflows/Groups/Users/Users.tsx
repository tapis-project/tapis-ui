import React from 'react';
import { Workflows } from "@tapis/tapis-typescript"
import { useList } from "tapis-hooks/workflows/groupusers"
import { SectionMessage } from 'tapis-ui/_common';
import { QueryWrapper } from "tapis-ui/_wrappers"
import { Toolbar } from "../../_components"
import styles from "./Users.module.scss"

type UsersProps = {
  groupId: string
}

const Users: React.FC<UsersProps> = ({groupId}) => {
  const { data, isLoading, error } = useList({groupId})
  const users: Array<Workflows.GroupUser> = data?.result ?? []

  return (
    <div>
      <h2>Users <span className={styles["count"]}>{users.length}</span></h2>
      <Toolbar groupId={groupId} buttons={["addgroupuser"]}/>
      <div className={styles["container"]}>
        <QueryWrapper isLoading={isLoading} error={error}>
          <div id="users">
            {users.length ? users.map((user, i) => {
              let evenodd:string = i%2 > 0 ? styles["odd"] : styles["even"]
              let last: string = i == users.length - 1 ? styles["last"] : ""
              return (
                  <div className={`${styles["user"]} ${evenodd} ${last}`}>
                    {user.username}
                  </div>
              )
            }) : (
              <SectionMessage type="info">No users</SectionMessage>
              )
            }
          </div>
        </QueryWrapper>
      </div>
    </div>
  )
};

export default Users;
