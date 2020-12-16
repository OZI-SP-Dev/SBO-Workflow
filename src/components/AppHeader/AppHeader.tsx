import React, { FunctionComponent } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap';
import './AppHeader.css'

export const AppHeader: FunctionComponent = () => {

    return (

        <Navbar id="mainnav" className="p-0 m-0">
            <Navbar.Brand className={(process.env.REACT_APP_TEST_SYS ? "test " : "mr-0 pl-1 pr-3")}>
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/">
                    <Nav.Link className="p-0">
                        <img src="./orangeeagle2.png" alt="SBO Logo" height="30px" />
                        <span className="align-middle"> SBO Workflow</span>
                    </Nav.Link>
                </LinkContainer>
            </Navbar.Brand>
            <Nav className="mr-auto">
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/">
                    <Nav.Link className="bordered">
                        <span className="align-middle">Home</span>
                    </Nav.Link>
                </LinkContainer>
            </Nav>
            <Nav className="ml-auto">
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/Help">
                    <Nav.Link className="bordered">
                        <span className="align-middle">Help</span>
                    </Nav.Link>
                </LinkContainer>
            </Nav>
            <Nav>
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/Reports">
                    <Nav.Link>
                        <span className="align-middle">Reports</span>
                    </Nav.Link>
                </LinkContainer>
            </Nav>
        </Navbar >
    )
}