import React, { FunctionComponent, useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { getBlankProcess, IProcess, ProcessTypes } from "../../api/DomainObjects";
import { useProcessDetails } from "../../hooks/useProcessDetails";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { ProcessDetails } from "../ProcessDetails/ProcessDetails";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { StatusWorkflow } from "../StatusWorkflow/StatusWorkflow";

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
    }, [processDetails.loading])

    return (
        <Col xl="11" className="m-auto">
            <HeaderBreadcrumbs crumbs={[{ crumbName: "Home", href: "#/" }, { crumbName: process ? process.SolicitationNumber : '' }]} />
            <StatusWorkflow className="mt-3" process={process ? process : getBlankProcess(ProcessTypes.DD2579)} />
            <Col xl="5" lg="5" md="5" sm="5" xs="5" className="mt-3">
                <ProcessDetails
                    process={process ? process : getBlankProcess(ProcessTypes.DD2579)}
                />
            </Col>
            <SBOSpinner show={processDetails.loading} displayText="Loading Process..." />
        </Col>
    );
}