import React, { FunctionComponent } from "react";
import { Card, Col } from "react-bootstrap";
import { IProcess, nextStageText, Stages } from "../../api/DomainObjects";
import { StatusListItem } from "./StatusListItem";
import './StatusWorkflow.css';


export interface IStatusWorkflowProps {
    process: IProcess,
    className?: string
}

export const StatusWorkflow: FunctionComponent<IStatusWorkflowProps> = (props) => {

    return (
        <Card className={"sbo-gray-gradiant " + props.className}>
            <Col className="m-3">
                <h4>{props.process.ProcessType} Process: {props.process.SolicitationNumber}</h4>
                <p className="mb-0">
                    <strong>Current SBO Stage: </strong>{props.process.CurrentStage}<br />
                    <strong>Next SBO Stage: </strong>{nextStageText(props.process)}
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