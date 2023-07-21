import { Icon } from "@fluentui/react";
import { FunctionComponent, useContext, useState } from "react";
import { Button, Card, Col, Pagination, Row, Table } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import {
  IProcess,
  ParentOrgs,
  ProcessTypes,
  Stages,
} from "../../api/DomainObjects";
import { FilterField } from "../../api/ProcessesApi";
import { IPagedProcesses } from "../../hooks/usePagedProcesses";
import { OrgsContext } from "../../providers/OrgsContext";
import { DatePickerFilter } from "../Filter/DatePickerFilter";
import { KeywordFilter } from "../Filter/KeywordFilter";
import { PeoplePickerFilter } from "../Filter/PeoplePickerFilter";
import { SelectorFilter } from "../Filter/SelectorFilter";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { ProcessForm } from "../ProcessForm/ProcessForm";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import "./Processes.css";
import { ProcessesTableHeader } from "./ProcessesTableHeader";

export interface IProcessesProps {
  pagedProcesses: IPagedProcesses;
}

export const Processes: FunctionComponent<IProcessesProps> = (props) => {
  const history = useHistory();
  const { orgs } = useContext(OrgsContext);

  const [showDD2579Form, setShowDD2579Form] = useState<boolean>(false);
  const [showISPForm, setShowISPForm] = useState<boolean>(false);
  const [sort, setSort] = useState<{
    field: FilterField;
    ascending: boolean;
  }>();

  const submitProcess = async (process: IProcess) => {
    let p = await props.pagedProcesses.submitProcess(process);
    history.push(`/Processes/View/${p.Id}`);
    return p;
  };

  const sortIconOnClick = (field: FilterField) => {
    let newSort: { field: FilterField; ascending: boolean } | undefined = {
      field: field,
      ascending: true,
    };
    if (sort?.field === field) {
      newSort = sort.ascending ? { field: field, ascending: false } : undefined;
    }
    setSort(newSort);
    props.pagedProcesses.sortBy(newSort?.field, newSort?.ascending);
  };

  const sortDir = (field: string) => {
    return sort?.field === field
      ? sort.ascending
        ? "ascending"
        : "descending"
      : undefined;
  };

  return (
    <Row className="m-0">
      <Col xl="11" className="m-auto">
        <HeaderBreadcrumbs crumbs={[{ crumbName: "Home" }]} />
        <ProcessForm
          processType={ProcessTypes.DD2579}
          showModal={showDD2579Form}
          handleClose={() => setShowDD2579Form(false)}
          submit={submitProcess}
        />
        <ProcessForm
          processType={ProcessTypes.ISP}
          showModal={showISPForm}
          handleClose={() => setShowISPForm(false)}
          submit={submitProcess}
        />
        <Card className="sbo-gray-gradiant mt-3 mb-3">
          <Row className="m-3">
            <Button
              className="mr-3 sbo-button"
              onClick={() => setShowDD2579Form(true)}
            >
              <Icon iconName="FabricOpenFolderHorizontal" />
              <br />
              Create DD2579
            </Button>
            <Button className="sbo-button" onClick={() => setShowISPForm(true)}>
              <Icon iconName="FabricOpenFolderHorizontal" />
              <br />
              Create ISP
            </Button>
          </Row>
        </Card>
        <h3>Small Business Processes</h3>
        <Table striped bordered size="sm">
          <thead>
            <tr>
              <ProcessesTableHeader
                text="Solicitation/Contract #"
                sort={sortDir("SolicitationNumber")}
                clickSort={() => sortIconOnClick("SolicitationNumber")}
              >
                <KeywordFilter
                  iconClassName="ml-auto"
                  field="SolicitationNumber"
                  active={props.pagedProcesses.activeFilters.includes(
                    "SolicitationNumber"
                  )}
                  title="Solicitation/Contract # Filter"
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                className="sbo-width-sm"
                text="Process"
                sort={sortDir("ProcessType")}
                clickSort={() => sortIconOnClick("ProcessType")}
              >
                <SelectorFilter
                  iconClassName="ml-auto"
                  field="ProcessType"
                  active={props.pagedProcesses.activeFilters.includes(
                    "ProcessType"
                  )}
                  title="Process Type Filter"
                  values={Object.values(ProcessTypes)}
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                text="Buyer"
                sort={sortDir("Buyer")}
                clickSort={() => sortIconOnClick("Buyer")}
              >
                <PeoplePickerFilter
                  iconClassName="ml-auto"
                  field="Buyer"
                  active={props.pagedProcesses.activeFilters.includes("Buyer")}
                  title="Buyer Filter"
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                className="sbo-width-md"
                text="Buyer's Org"
                sort={sortDir("Org")}
                clickSort={() => sortIconOnClick("Org")}
              >
                <SelectorFilter
                  iconClassName="ml-auto"
                  field="Org"
                  active={props.pagedProcesses.activeFilters.includes("Org")}
                  title="Buyer's Org Filter"
                  values={
                    orgs
                      ? Object.values<string>(ParentOrgs).concat(
                          orgs.map((org) => org.Title)
                        )
                      : []
                  }
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                className="sbo-width-md"
                text="Current Stage"
                sort={sortDir("CurrentStage")}
                clickSort={() => sortIconOnClick("CurrentStage")}
              >
                <SelectorFilter
                  iconClassName="ml-auto"
                  field="CurrentStage"
                  active={props.pagedProcesses.activeFilters.includes(
                    "CurrentStage"
                  )}
                  title="Current Stage Filter"
                  values={Object.values(Stages)}
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                text="Current Assignee"
                sort={sortDir("CurrentAssignee")}
                clickSort={() => sortIconOnClick("CurrentAssignee")}
              >
                <PeoplePickerFilter
                  iconClassName="ml-auto"
                  field="CurrentAssignee"
                  active={props.pagedProcesses.activeFilters.includes(
                    "CurrentAssignee"
                  )}
                  title="Current Assignee Filter"
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                className="sbo-width-md"
                text="Stage Start"
                sort={sortDir("CurrentStageStartDate")}
                clickSort={() => sortIconOnClick("CurrentStageStartDate")}
              >
                <DatePickerFilter
                  iconClassName="ml-auto"
                  field="CurrentStageStartDate"
                  active={props.pagedProcesses.activeFilters.includes(
                    "CurrentStageStartDate"
                  )}
                  title="Stage Start Filter"
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
              <ProcessesTableHeader
                className="sbo-width-md"
                text="Process Start"
                sort={sortDir("Created")}
                clickSort={() => sortIconOnClick("Created")}
              >
                <DatePickerFilter
                  iconClassName="ml-auto"
                  field="Created"
                  active={props.pagedProcesses.activeFilters.includes(
                    "Created"
                  )}
                  title="Process Start Filter"
                  addFilter={props.pagedProcesses.addFilter}
                  clearFilter={props.pagedProcesses.clearFilter}
                />
              </ProcessesTableHeader>
            </tr>
          </thead>
          <tbody>
            {props.pagedProcesses.processes.map((process) => (
              <tr key={process.Id}>
                <td className="align-middle">
                  <Link to={`/Processes/View/${process.Id}`}>
                    {process.SolicitationNumber}
                  </Link>
                </td>
                <td className="align-middle">{process.ProcessType}</td>
                <td className="align-middle">{process.Buyer.Title}</td>
                <td className="align-middle">{process.Org}</td>
                <td className="align-middle">{process.CurrentStage}</td>
                <td className="align-middle">
                  {process.CurrentAssignee.Title}
                </td>
                <td className="align-middle">
                  {process.CurrentStageStartDate.toFormat("DD")}
                </td>
                <td className="align-middle">
                  {process.Created.toFormat("DD")}
                </td>
              </tr>
            ))}
            <tr className="paging-row">
              <td colSpan={8} className="p-0">
                <Pagination className="m-0" size="sm">
                  <Pagination.Prev
                    disabled={props.pagedProcesses.page === 1}
                    onClick={props.pagedProcesses.decrementPage}
                  >
                    {"<"} Prev
                  </Pagination.Prev>
                  <Pagination.Item disabled>
                    {props.pagedProcesses.page}
                  </Pagination.Item>
                  <Pagination.Next
                    disabled={!props.pagedProcesses.hasNext}
                    onClick={props.pagedProcesses.incrementPage}
                  >
                    Next {">"}
                  </Pagination.Next>
                </Pagination>
              </td>
            </tr>
          </tbody>
        </Table>
        <SBOSpinner
          show={props.pagedProcesses.loading}
          displayText="Loading Processes..."
        />
      </Col>
    </Row>
  );
};
