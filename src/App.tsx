import React from 'react';
import { Container } from 'react-bootstrap';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import { Help } from './components/Help/Help';
import { Processes } from './components/Processes/Processes';
import { Reports } from './components/Reports/Reports';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Container fluid className="p-0">
          <AppHeader />
          <Switch>
            <Route exact path="/(home)?">
              <Processes />
            </Route>
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
