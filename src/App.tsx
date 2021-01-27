import React from 'react';
import { Container } from 'react-bootstrap';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import { Help } from './components/Help/Help';
import { ProcessesRoute } from './components/ProcessesRoute/ProcessesRoute';
import { Reports } from './components/Reports/Reports';

function App() {

  return (
    <div className="App">
      <HashRouter>
        <Container fluid className="p-0">
          <AppHeader />
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
            <Route path="/Reports">
              <Reports />
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

export default App;
