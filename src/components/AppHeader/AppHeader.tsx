import { FunctionComponent, useContext } from "react";
import { Form, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ReportBugs } from "../ReportBugs/ReportBugs";
import { OLsContext } from "../../providers/OLsContext";
import { UserContext } from "../../providers/UserProvider";
import "./AppHeader.css";

export const AppHeader: FunctionComponent = () => {
  const { ols, currentOL, loading, setOL } = useContext(OLsContext);
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
              value={currentOL}
              onChange={(e) => (setOL ? setOL(e.target.value) : {})}
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
