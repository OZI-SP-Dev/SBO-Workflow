import React, { FunctionComponent, useEffect } from "react";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import { Processes } from "../Processes/Processes";
import { ProcessView } from "../ProcessView/ProcessView";

export interface IProcessesRouteProps {
    processId?: number,
    reportError(error: string): void
}

export const ProcessesRoute: FunctionComponent<IProcessesRouteProps> = (props) => {

    const pagedProcesses = usePagedProcesses();

    // refreshes the processes page when navigating back to the processes table
    useEffect(() => {
        if (!props.processId) {
            pagedProcesses.refreshPage();
        } // eslint-disable-next-line
    }, [props.processId]);

    useEffect(() => {
        if (pagedProcesses.error) {
            props.reportError(pagedProcesses.error);
        }
    }, [pagedProcesses.error]);

    return (
        props.processId !== undefined ?
            <ProcessView processId={props.processId} process={pagedProcesses.fetchCachedProcess(props.processId)} reportError={props.reportError} /> :
            <Processes pagedProcesses={pagedProcesses} />
    );
}