import React, { FunctionComponent } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { IProcess, Stages } from "../../api/DomainObjects";
import { StatusListItem } from "./StatusListItem";
import './StatusWorkflow.css';


export interface IStatusWorkflowProps {
    process: IProcess,
    className?: string
}

export const StatusWorkflow: FunctionComponent<IStatusWorkflowProps> = (props) => {

    const nextStageText = () => {
        switch (props.process.CurrentStage) {
            case Stages.BUYER_REVIEW:
                return "Send to CO for Initial Review";
            case Stages.CO_INITIAL_REVIEW:
                return "Send to Small Business for Review";
            case Stages.SBP_REVIEW:
                return "Send to SBA PCR Review OR Send to CO Final Review";
            case Stages.SBA_PCR_REVIEW:
                return "Send to CO Final Review";
            case Stages.CO_FINAL_REVIEW:
                return "Complete process to notify " + props.process.Buyer.Title;
            case Stages.COMPLETED:
                return "This process has completed";
        }
    }

    return (
        <Card className={"sbo-gray-gradiant " + props.className}>
            <Col className="m-3">
                <h4>{props.process.ProcessType} Process: {props.process.SolicitationNumber}</h4>
                <p>
                    <strong>Current SBO Stage: </strong>{props.process.CurrentStage}<br />
                    <strong>Next SBO Stage: </strong>{nextStageText()}
                </p>
                <ul className="status-workflow p-0 mr-auto">
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.BUYER_REVIEW} />
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.CO_INITIAL_REVIEW} />
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.SBP_REVIEW} />
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.SBA_PCR_REVIEW} />
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.CO_FINAL_REVIEW} />
                    <StatusListItem
                        processStatus={props.process.CurrentStage}
                        status={Stages.COMPLETED} />
                </ul>
            </Col>
        </Card>
    )
}