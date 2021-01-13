import { Icon } from "@fluentui/react";
import React, { FunctionComponent } from "react";
import { Button, Card, Col, Pagination, Row, Table } from "react-bootstrap";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import "./Processes.css"


export const Processes: FunctionComponent = () => {

    const pagedProcesses = usePagedProcesses();

    return (
        <Col xl="11" className="m-auto">
            <Card className="sbo-gray-gradiant mt-3 mb-3">
                <Row className="m-3 sbo-create-form-row">
                    <Button className="mr-3">
                        <Icon iconName="FabricOpenFolderHorizontal" /><br />
                        Create DD2579
                    </Button>
                    <Button>
                        <Icon iconName="FabricOpenFolderHorizontal" /><br />
                        Create ISP
                    </Button>
                </Row>
            </Card>
            <h3>Small Business Processes</h3>
            <Table striped bordered size="sm">
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
                    {pagedProcesses.processes.map(process =>
                        <tr key={process.Id}>
                            <td>{process.SolicitationNumber}</td>
                            <td>{process.ProcessType}</td>
                            <td>{process.Buyer.Title}</td>
                            <td>{process.Org}</td>
                            <td>{process.CurrentStage}</td>
                            <td>{process.CurrentAssignee.Title}</td>
                            <td>{process.CurrentStageStartDate.toFormat("DD")}</td>
                            <td>{process.Created.toFormat("DD")}</td>
                        </tr>
                    )}
                    <tr className="paging-row">
                        <td colSpan={8} className="p-0">
                            <Pagination className="m-0" size="sm">
                                <Pagination.Prev disabled={pagedProcesses.page === 1} onClick={pagedProcesses.decrementPage}>{'\<'} Prev</Pagination.Prev>
                                <Pagination.Item disabled>{pagedProcesses.page}</Pagination.Item>
                                <Pagination.Next disabled={!pagedProcesses.hasNext} onClick={pagedProcesses.incrementPage}>Next {'\>'}</Pagination.Next>
                            </Pagination>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <SBOSpinner show={pagedProcesses.loading} displayText="Loading Processes..." />
        </Col>
    );
}