import React, { FunctionComponent } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from 'react-router-bootstrap';
import { ReportBugs } from "../ReportBugs/ReportBugs";
import './AppHeader.css'

export const AppHeader: FunctionComponent = () => {

    return (

        <Navbar id="mainnav" className="p-0 m-0" bg={(process.env.REACT_APP_TEST_SYS ? "danger" : "")}>
            <Navbar.Brand className="mr-0 pl-1 pr-3">
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/">
                    <Nav.Link className="p-0">
                        <img src="./orangeeagle2.png" alt="SBO Logo" height="30px" />
                        <span>{(process.env.REACT_APP_TEST_SYS ? " TEST" : "")} Kolab</span>
                    </Nav.Link>
                </LinkContainer>
            </Navbar.Brand>
            <Nav className="mr-auto">
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/">
                    <Nav.Link className="bordered">
                        <span>Home</span>
                    </Nav.Link>
                </LinkContainer>
            </Nav>
            <Nav className="ml-auto">
                <LinkContainer isActive={m => m !== null && m?.isExact} to="/Help">
                    <Nav.Link className="bordered">
                        <span>Help</span>
                    </Nav.Link>
                </LinkContainer>
            </Nav>
            <Nav>
                <ReportBugs />
            </Nav>
        </Navbar >
    )
}