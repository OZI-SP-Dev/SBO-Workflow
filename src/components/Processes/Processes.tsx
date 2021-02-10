import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useState } from "react";
import { Button, Card, Col, Pagination, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ProcessTypes } from "../../api/DomainObjects";
import { IPagedProcesses } from "../../hooks/usePagedProcesses";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { ProcessForm } from "../ProcessForm/ProcessForm";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import "./Processes.css";

export interface IProcessesProps {
    pagedProcesses: IPagedProcesses
}

export const Processes: FunctionComponent<IProcessesProps> = (props) => {

    const [showDD2579Form, setShowDD2579Form] = useState<boolean>(false);
    const [showISPForm, setShowISPForm] = useState<boolean>(false);

    return (
        <Col xl="11" className="m-auto">
            <HeaderBreadcrumbs crumbs={[{ crumbName: "Home" }]} />
            <ProcessForm processType={ProcessTypes.DD2579}
                showModal={showDD2579Form}
                handleClose={() => setShowDD2579Form(false)}
                submit={props.pagedProcesses.submitProcess} />
            <ProcessForm processType={ProcessTypes.ISP}
                showModal={showISPForm}
                handleClose={() => setShowISPForm(false)}
                submit={props.pagedProcesses.submitProcess} />
            <Card className="sbo-gray-gradiant mt-3 mb-3">
                <Row className="m-3">
                    <Button className="mr-3 sbo-button" onClick={() => setShowDD2579Form(true)}>
                        <Icon iconName="FabricOpenFolderHorizontal" /><br />
                        Create DD2579
                    </Button>
                    <Button className="sbo-button" onClick={() => setShowISPForm(true)}>
                        <Icon iconName="FabricOpenFolderHorizontal" /><br />
                        Create ISP
                    </Button>
                </Row>
            </Card>
            <h3>Small Business Processes</h3>
            <Table striped bordered size="sm" responsive="md">
                <thead>
                    <tr>
                        <th>Solicitation/Contract #</th>
                        <th>Process</th>
                        <th>Buyer</th>
                        <th>Buyer's Org</th>
                        <th>Current Stage</th>
                        <th>Current Assignee</th>
                        <th>Stage Start</th>
                        <th>Process Start</th>
                    </tr>
                </thead>
                <tbody>
                    {props.pagedProcesses.processes.map(process =>
                        <tr key={process.Id}>
                            <td className="align-middle">
                                <Link to={`/Processes/View/${process.Id}`}>
                                    <Button variant="link">
                                        {process.SolicitationNumber}
                                    </Button>
                                </Link>
                            </td>
                            <td className="align-middle">{process.ProcessType}</td>
                            <td className="align-middle">{process.Buyer.Title}</td>
                            <td className="align-middle">{process.Org}</td>
                            <td className="align-middle">{process.CurrentStage}</td>
                            <td className="align-middle">{process.CurrentAssignee.Title}</td>
                            <td className="align-middle">{process.CurrentStageStartDate.toFormat("DD")}</td>
                            <td className="align-middle">{process.Created.toFormat("DD")}</td>
                        </tr>
                    )}
                    <tr className="paging-row">
                        <td colSpan={8} className="p-0">
                            <Pagination className="m-0" size="sm">
                                <Pagination.Prev disabled={props.pagedProcesses.page === 1} onClick={props.pagedProcesses.decrementPage}>{'<'} Prev</Pagination.Prev>
                                <Pagination.Item disabled>{props.pagedProcesses.page}</Pagination.Item>
                                <Pagination.Next disabled={!props.pagedProcesses.hasNext} onClick={props.pagedProcesses.incrementPage}>Next {'>'}</Pagination.Next>
                            </Pagination>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <SBOSpinner show={props.pagedProcesses.loading} displayText="Loading Processes..." />
        </Col >
    );
}