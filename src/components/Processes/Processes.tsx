import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useState } from "react";
import { Button, Card, Col, Pagination, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IPerson, IProcess, Person, ProcessTypes } from "../../api/DomainObjects";
import { UserApiConfig } from "../../api/UserApi";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import { ProcessForm } from "../ProcessForm/ProcessForm";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import "./Processes.css";


export const Processes: FunctionComponent = () => {

    const userApi = UserApiConfig.getApi();

    const pagedProcesses = usePagedProcesses();
    const [showDD2579Form, setShowDD2579Form] = useState<boolean>(false);
    const [showISPForm, setShowISPForm] = useState<boolean>(false);

    const getPerson = async (person: IPerson): Promise<IPerson> => {
        return new Person({ Id: await userApi.getUserId(person.EMail), Title: person.Title, EMail: person.EMail });
    }

    const submitProcess = async (process: IProcess): Promise<IProcess> => {
        process.ContractingOfficer = await getPerson(process.ContractingOfficer);
        process.SmallBusinessProfessional = await getPerson(process.SmallBusinessProfessional);
        process.Buyer = await getPerson(process.Buyer);
        process.CurrentAssignee = await getPerson(process.Buyer);
        return pagedProcesses.submitProcess(process);
    }

    return (
        <Col xl="11" className="m-auto">
            <ProcessForm processType={ProcessTypes.DD2579}
                showModal={showDD2579Form}
                handleClose={() => setShowDD2579Form(false)}
                submit={submitProcess} />
            <ProcessForm processType={ProcessTypes.ISP}
                showModal={showISPForm}
                handleClose={() => setShowISPForm(false)}
                submit={submitProcess} />
            <Card className="sbo-gray-gradiant mt-3 mb-3">
                <Row className="m-3 sbo-create-form-row">
                    <Button className="mr-3" onClick={() => setShowDD2579Form(true)}>
                        <Icon iconName="FabricOpenFolderHorizontal" /><br />
                        Create DD2579
                    </Button>
                    <Button onClick={() => setShowISPForm(true)}>
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
                                <Pagination.Prev disabled={pagedProcesses.page === 1} onClick={pagedProcesses.decrementPage}>{'<'} Prev</Pagination.Prev>
                                <Pagination.Item disabled>{pagedProcesses.page}</Pagination.Item>
                                <Pagination.Next disabled={!pagedProcesses.hasNext} onClick={pagedProcesses.incrementPage}>Next {'>'}</Pagination.Next>
                            </Pagination>
                        </td>
                    </tr>
                </tbody>
            </Table>
            <SBOSpinner show={pagedProcesses.loading} displayText="Loading Processes..." />
        </Col >
    );
}