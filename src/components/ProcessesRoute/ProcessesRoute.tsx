import React, { FunctionComponent, useEffect } from "react";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import { Processes } from "../Processes/Processes";
import { ProcessView } from "../ProcessView/ProcessView";

export interface IProcessesRouteProps {
    processId?: number
}

export const ProcessesRoute: FunctionComponent<IProcessesRouteProps> = (props) => {

    const pagedProcesses = usePagedProcesses();

    // refreshes the processes page when navigating back to the processes table
    useEffect(() => {
        if (!props.processId) {
            pagedProcesses.refreshPage();
        } // eslint-disable-next-line
    }, [props.processId]);

    return (
        props.processId !== undefined ?
            <ProcessView processId={props.processId} process={pagedProcesses.fetchCachedProcess(props.processId)} /> :
            <Processes pagedProcesses={pagedProcesses} />
    );
}