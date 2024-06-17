import React, { useState } from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from '../_components/PipelineCard/PipelineCard.module.scss';
import { PipelineCard } from "../_components";
import { Skeleton, Pagination } from '@mui/material';
import { Workflows } from '@tapis/tapis-typescript';
import { SectionHeader } from "@tapis/tapisui-common"

const Dashboard: React.FC = () => {
  const groups = Hooks.Groups.useList();
  const groupIds: Array<string> = [];
  const groupMapping: {[key: string]: Workflows.Group} = {}
  groups.data?.result.map((group) => {
    if (group) {
      groupIds.push(group.id!)
      groupMapping[group.uuid!] = group
    }
  });
  // const identities = Hooks.Identities.useList();
  // const archives = Hooks.Archives.useListAll({ groupIds });
  const { data: pipelines, isLoading } = Hooks.Pipelines.useListAll({ groupIds })
  const [page, setPage] = useState<number>(1);
  return (
    <div >
      <div className={styles["cards-container"]}>
        <SectionHeader>
          Pipelines {pipelines && `[${pipelines.result.length}]`}
        </SectionHeader>
        {
          (pipelines && pipelines.result.length > 0) &&
          <Pagination
            className={styles["paginator"]}
            shape="rounded"
            count={Math.ceil(pipelines.result.length / 6)}
            page={page}
            onChange={(_, value) => {
              setPage(value);
            }}
          />
        }
        {
          isLoading ? (
            <div className={`${styles["cards"]} ${styles["skeletons"]}`}>
              {
                [...Array(6).keys()].map(() => {
                  return (
                    <Skeleton variant="rectangular" height="120px" className={`${styles["card"]} ${styles["skeleton"]}`} />
                  )
                })
              }
            </div>
          ) : (
            <div className={`${styles["cards"]}`}>
            {
              pipelines?.result && (
                pipelines.result.map((pipeline, i) => {
                  // Determine the page value for each card given that there are
                  // 6 cards per page
                  i++
                  if (i > 6 * page || i <= 6 * page - 6 ) {
                    return <></>
                  }
                  return (
                    <PipelineCard pipeline={pipeline} groupId={groupMapping[pipeline.group!].id!}/>
                  )
                })
              )
            }
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Dashboard;

// type DashboardCardProps = {
//   icon: string;
//   link: string;
//   counter: string;
//   name: string;
//   text: string;
//   loading: boolean;
// };

// const DashboardCard: React.FC<DashboardCardProps> = ({
//   icon,
//   link,
//   counter,
//   name,
//   text,
//   loading,
// }) => {
//   return (
//     <Card className={styles.card}>
//       <CardHeader>
//         <div className={styles['card-header']}>
//           <div>
//             <Icon name={icon} className="dashboard__card-icon" />
//           </div>
//           <div>{name}</div>
//         </div>
//       </CardHeader>
//       <CardBody>
//         <CardTitle tag="h5">
//           {loading ? (
//             <LoadingSpinner placement="inline" />
//           ) : (
//             <div>{counter}</div>
//           )}
//         </CardTitle>
//         <CardText>{text}</CardText>
//       </CardBody>
//       <CardFooter className={styles['card-footer']}>
//         <Link to={link}>Go to {name}</Link>
//         <Icon name="push-right" />
//       </CardFooter>
//     </Card>
//   );
// };

