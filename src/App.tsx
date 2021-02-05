import React, { FunctionComponent, useState } from 'react';
import { Alert, Container } from 'react-bootstrap';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import { Help } from './components/Help/Help';
import { ProcessesRoute } from './components/ProcessesRoute/ProcessesRoute';
import { Reports } from './components/Reports/Reports';

export const App: FunctionComponent = () => {

  const [errors, setErrors] = useState<string[]>([]);

  const addError = (e: string) => {
    if (e && !errors.includes(e)) {
      let newErrors = errors;
      newErrors.push(e);
      setErrors(newErrors);
    }
  }

  return (
    <div className="App">
      {errors.map((e, i) =>
        <Alert key={i} variant="danger">{e}</Alert>
      )}
      <HashRouter>
        <Container fluid className="p-0">
          <AppHeader />
          <Switch>
            <Route exact path="/(home)?">
              <ProcessesRoute reportError={addError} />
            </Route>
            <Route
              path="/Processes/View/:processId"
              render={({ match }) =>
                <ProcessesRoute processId={Number(match.params.processId)} reportError={addError} />}
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
