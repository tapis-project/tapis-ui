import React from 'react';
import {
    Route,
    useRouteMatch,
    Switch,
} from 'react-router-dom';

import { default as Models } from '../Models';

const Router: React.FC = () => {
    const { path } = useRouteMatch();
    return (
        <Switch>
            <Route path={path} exact>
                <Models />
            </Route>

        </Switch>
    );
};

export default Router;