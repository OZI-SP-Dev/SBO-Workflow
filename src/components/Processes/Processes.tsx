import React, { FunctionComponent } from "react";
import { Col, Table } from "react-bootstrap";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import "./Processes.css"


export const Processes: FunctionComponent = () => {

    const pagedProcesses = usePagedProcesses();

    return (
        <Col xl="10" className="m-auto">
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
                        <tr>
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
                </tbody>
            </Table>
        </Col>
    );
}