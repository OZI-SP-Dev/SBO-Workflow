import React, { FunctionComponent, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { getBlankProcess, IProcess, ProcessTypes } from "../../api/DomainObjects";
import { useProcessDetails } from "../../hooks/useProcessDetails";
import { DocumentsView } from "../DocumentsView/DocumentsView";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { NotesView } from "../NotesView/NotesView";
import { ProcessDetails } from "../ProcessDetails/ProcessDetails";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { StatusWorkflow } from "../StatusWorkflow/StatusWorkflow";

export interface IProcessViewProps {
    processId: number,
    process?: IProcess,
    reportError(error: string): void
}

export const ProcessView: FunctionComponent<IProcessViewProps> = (props) => {

    const processDetails = useProcessDetails(props.processId);

    const [process, setProcess] = useState<IProcess | undefined>(props.process);

    useEffect(() => {
        if (processDetails.process) {
            setProcess(processDetails.process);
        } // eslint-disable-next-line
    }, [processDetails.loading]);

    useEffect(() => {
        if (processDetails.error) {
            props.reportError(processDetails.error);
        }
    }, [processDetails.error]);

    return (
        <Col xl="11" className="m-auto">
            <HeaderBreadcrumbs crumbs={[{ crumbName: "Home", href: "#/" }, { crumbName: process ? process.SolicitationNumber : '' }]} />
            <StatusWorkflow className="mt-3" process={process ? process : getBlankProcess(ProcessTypes.DD2579)} />
            <Row className="mt-3 ml-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
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
    );
}