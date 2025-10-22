import React from "react";
import {
  Route,
  useRouteMatch,
  Switch,
  RouteComponentProps,
} from "react-router-dom";
import { Models } from "../../Models";
import ModelsByPlatform from "../ModelsByPlatform";
import ModelDetails from "../ModelDetails";
import ModelDetailsByPlatform from "../ModelDetailsByPlatform";

const Router: React.FC = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}`} exact>
        <Models />
      </Route>

      <Route
        path={`${path}/platform/:platform/:modelId+`}
        render={({
          match: {
            params: { platform, modelId },
          },
        }: RouteComponentProps<{ platform: string; modelId: string }>) => {
          return <ModelDetailsByPlatform />;
        }}
      />

      <Route
        path={`${path}/platform/:platform`}
        render={({
          match: {
            params: { platform },
          },
        }: RouteComponentProps<{ platform: string }>) => {
          return <ModelsByPlatform />;
        }}
      />

      <Route
        path={`${path}/:modelId+`}
        render={({
          match: {
            params: { modelId },
          },
        }: RouteComponentProps<{ modelId: string }>) => {
          return <ModelDetails modelId={modelId} />;
        }}
      />
    </Switch>
  );
};

export default Router;
