import { FunctionComponent } from "react";
import { Col, Row } from "react-bootstrap";
import { IProcess, ProcessTypes } from "../../api/DomainObjects";
import "./ProcessDetails.css"

export interface IProcessDetailsProps {
    process: IProcess
}

export const ProcessDetails: FunctionComponent<IProcessDetailsProps> = (props) => {

    return (
        <div className="process-details">
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Solicitation/Contract Number</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.SolicitationNumber}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Program Name or Item Being Acquired</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.ProgramName}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Buyer's Organization</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.Org}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Buyer</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.Buyer.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Contracting Officer</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.ContractingOfficer.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Small Business Professional</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.SmallBusinessProfessional.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>SBA PCR</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.SBAPCR?.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>PoP</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.SboDuration}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Total Contract Value</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.ContractValueDollars}
                </Col>
            </Row>
            {props.process.ProcessType === ProcessTypes.DD2579 && <Row>
                <Col xl="5" lg="5" md="5" sm="5" xs="5">
                    <strong>Set-Aside Recommendation</strong>
                </Col>
                <Col xl="7" lg="7" md="7" sm="7" xs="7">
                    {props.process.SetAsideRecommendation}
                </Col>
            </Row>}
        </div>
    );
}