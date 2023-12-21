import { FunctionComponent, useContext, useEffect } from "react";
import { usePagedProcesses } from "../../hooks/usePagedProcesses";
import { Processes } from "../Processes/Processes";
import { ProcessView } from "../ProcessView/ProcessView";
import { OLsContext } from "../../providers/OLsContext";

export interface IProcessesRouteProps {
  processId?: number;
}

export const ProcessesRoute: FunctionComponent<IProcessesRouteProps> = (
  props
) => {
  const pagedProcesses = usePagedProcesses();
  const { currentOL } = useContext(OLsContext);

  // refreshes the processes page when navigating back to the processes table
  useEffect(() => {
    if (!props.processId && !pagedProcesses.loading) {
      pagedProcesses.refreshPage();
    } // eslint-disable-next-line
  }, [props.processId, currentOL]);

  return props.processId !== undefined ? (
    <ProcessView
      processId={props.processId}
      process={pagedProcesses.fetchCachedProcess(props.processId)}
    />
  ) : (
    <Processes pagedProcesses={pagedProcesses} />
  );
};
