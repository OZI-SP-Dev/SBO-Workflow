import React, { FunctionComponent } from "react";
import { Col } from "react-bootstrap";
import { getBlankProcess, ProcessTypes } from "../../api/DomainObjects";
import { useProcessDetails } from "../../hooks/useProcessDetails";
import { ProcessDetails } from "../ProcessDetails/ProcessDetails";
import SBOSpinner from "../SBOSpinner/SBOSpinner";

export interface IProcessViewProps {
    processId: number
}

export const ProcessView: FunctionComponent<IProcessViewProps> = (props) => {

    const processDetails = useProcessDetails(props.processId);

    return (
        <Col xl="11" className="m-auto">
            <Col xl="5" lg="5" md="5" sm="5" xs="5">
                <ProcessDetails
                    process={processDetails.process ? processDetails.process : getBlankProcess(ProcessTypes.DD2579)}
                />
            </Col>
            <SBOSpinner show={processDetails.loading} displayText="Loading Process..." />
        </Col>
    );
}