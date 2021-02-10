import { Icon, IconButton } from "@fluentui/react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { getBlankProcess, IProcess, ProcessTypes } from "../../api/DomainObjects";
import { useProcessDetails } from "../../hooks/useProcessDetails";
import { DocumentsView } from "../DocumentsView/DocumentsView";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { NotesView } from "../NotesView/NotesView";
import { ProcessDetails } from "../ProcessDetails/ProcessDetails";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { StatusWorkflow } from "../StatusWorkflow/StatusWorkflow";
import "./ProcessView.css"

export interface IProcessViewProps {
    processId: number,
    process?: IProcess
}

export const ProcessView: FunctionComponent<IProcessViewProps> = (props) => {

    const processDetails = useProcessDetails(props.processId);

    const [process, setProcess] = useState<IProcess | undefined>(props.process);

    useEffect(() => {
        if (processDetails.process) {
            setProcess(processDetails.process);
        } // eslint-disable-next-line
    }, [processDetails.loading]);

    return (
        <>
            <Row className="m-0">
                <Col xs="11" className="m-auto">
                    <HeaderBreadcrumbs crumbs={[{ crumbName: "Home", href: "#/" }, { crumbName: process ? process.SolicitationNumber : '' }]} />
                </Col>
                <Col xl='1' xs="11" className="m-auto sbo-details-actions-col">
                    <Card className="mt-3 p-2 sbo-gray-gradiant sbo-details-actions-card">
                        <Row className="m-0 mr-auto">
                            <Col className="m-0 p-0 m-auto orange" xl='12' xs='2'><InfoTooltip id="sbo-send" trigger={<Icon iconName="NavigateForward" className="sbo-details-icon" />}>Send</InfoTooltip></Col>
                            <Col className="m-0 p-0 m-auto orange" xl='12' xs='2'><InfoTooltip id="sbo-rework" trigger={<Icon iconName="NavigateBack" className="sbo-details-icon" />}>Rework</InfoTooltip></Col>
                            <Col className="m-0 p-0 m-auto blue" xl='12' xs='2'><InfoTooltip id="sbo-edit" trigger={<Icon iconName="Edit" className="sbo-details-icon" />}>Edit</InfoTooltip></Col>
                            <Col className="m-0 p-0 m-auto red" xl='12' xs='2'><InfoTooltip id="sbo-delete" trigger={<Icon iconName="Delete" className="sbo-details-icon" />}>Delete</InfoTooltip></Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Col xs="11" className="m-auto">
                <StatusWorkflow className="mt-3" process={process ? process : getBlankProcess(ProcessTypes.DD2579)} />
                <Row className="mt-3 ml-2">
                    <Col xl="5" lg="5" md="12" sm="12" xs="12">
                        <ProcessDetails
                            process={process ? process : getBlankProcess(ProcessTypes.DD2579)}
                        />
                        <NotesView className="mt-5" notes={processDetails.notes} submitNote={processDetails.submitNote} />
                    </Col>
                    <Col>
                        <DocumentsView documents={processDetails.documents} loading={processDetails.loading} submitDocument={processDetails.submitDocument} deleteDocument={processDetails.deleteDocument} />
                    </Col>
                </Row>
                <SBOSpinner show={processDetails.loading} displayText="Loading Process..." />
            </Col>
        </>
    );
}