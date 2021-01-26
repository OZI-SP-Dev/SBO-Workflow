import React, { FunctionComponent } from "react";
import { Stages } from "../../api/DomainObjects";
import './StatusWorkflow.css';


export interface IStatusListItemProps {
    processStatus: Stages,
    status: Stages,
    className?: string
}

export const StatusListItem: FunctionComponent<IStatusListItemProps> = (props) => {

    let statuses = [
        Stages.BUYER_REVIEW,
        Stages.CO_INITIAL_REVIEW,
        Stages.SBP_REVIEW,
        Stages.SBA_PCR_REVIEW,
        Stages.CO_FINAL_REVIEW,
        Stages.COMPLETED
    ]

    // This is all of the completed statuses with the active status as the last item in the array
    let processStatuses = statuses.slice(0, statuses.findIndex(s => s === props.processStatus) + 1);

    const statusClass: "active-status" | "completed-status" | "inactive-status" =
        props.status === props.processStatus ? "active-status" : processStatuses.includes(props.status) ? "completed-status" : "inactive-status";

    return (
        <li className={props.className ? props.className : statusClass}>
            <div>{props.status}</div>
        </li>
    );
}