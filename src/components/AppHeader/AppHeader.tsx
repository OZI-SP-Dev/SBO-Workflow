import { FunctionComponent, useContext, useEffect } from "react";
import { Form, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ReportBugs } from "../ReportBugs/ReportBugs";
import { OLsContext } from "../../providers/OLsContext";
import { UserContext } from "../../providers/UserProvider";
import { useCachedOL } from "../../hooks/useCachedOL";
import "./AppHeader.css";

export const AppHeader: FunctionComponent = () => {
  const cachedOL = useCachedOL();
  const { ols, loading } = useContext(OLsContext);
  const { owner } = useContext(UserContext);

  return (
    <Navbar
      id="mainnav"
      className="p-0 m-0"
      bg={process.env.REACT_APP_TEST_SYS ? "danger" : ""}
    >
      <Navbar.Brand className="mr-0 pl-1 pr-3">
        <LinkContainer isActive={(m) => m !== null && m?.isExact} to="/">
          <Nav.Link className="p-0">
            <img src="./orangeeagle2.png" alt="SBO Logo" height="30px" />
            <span>{process.env.REACT_APP_TEST_SYS ? " TEST" : ""} Kolab</span>
          </Nav.Link>
        </LinkContainer>
      </Navbar.Brand>
      <Nav className="mr-auto">
        <LinkContainer isActive={(m) => m !== null && m?.isExact} to="/">
          <Nav.Link className="bordered">
            <span>Home</span>
          </Nav.Link>
        </LinkContainer>
      </Nav>
      {loading || !owner ? (
        ""
      ) : (
        <Form inline>
          <Form.Group>
            <Form.Label className="mr-sm-1">OL:</Form.Label>
            <Form.Control
              as="select"
              value={cachedOL.getCachedOL()}
              onChange={(e) => cachedOL.cacheOL(e.target.value)}
              size="sm"
              className="mr-sm-2"
            >
              {ols?.map((ol) => (
                <option key={ol.Title}>{ol.Title}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      )}
      <Nav>
        <LinkContainer isActive={(m) => m !== null && m?.isExact} to="/Help">
          <Nav.Link className="bordered">
            <span>Help</span>
          </Nav.Link>
        </LinkContainer>
      </Nav>
      <Nav>
        <ReportBugs />
      </Nav>
    </Navbar>
  );
};
