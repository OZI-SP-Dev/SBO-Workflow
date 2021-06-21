import React, { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import { ErrorList } from './components/ErrorList/ErrorList';
import { Help } from './components/Help/Help';
import { ProcessesRoute } from './components/ProcessesRoute/ProcessesRoute';
import { RouteParamRedirect } from './components/RouteParamRedirect/RouteParamRedirect';

export const App: FunctionComponent = () => {

  return (
    <div className="App">
      <HashRouter>
        <RouteParamRedirect />
        <Container fluid className="p-0 mt-5">
          <AppHeader />
          <ErrorList />
          <Switch>
            <Route exact path="/(home)?">
              <ProcessesRoute />
            </Route>
            <Route
              path="/Processes/View/:processId"
              render={({ match }) =>
                <ProcessesRoute processId={Number(match.params.processId)} />}
            />
            <Route path="/Help">
              <Help />
            </Route>
            <Route path="*">
              <NoMatch />
            </Route>
          </Switch>
        </Container>
      </HashRouter>
    </div>
  );
}

function NoMatch() {
  return (
    <div><h1>Page not found.</h1></div>
  );
}
