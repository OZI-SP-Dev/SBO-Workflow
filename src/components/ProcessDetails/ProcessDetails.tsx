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
                <Col md="5" sm="12" xs="12">
                    <strong>Solicitation/Contract Number</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.SolicitationNumber}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Program Name or Item Being Acquired</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.ProgramName}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Buyer's Organization</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.Org}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Buyer</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.Buyer.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Contracting Officer</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.ContractingOfficer.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Small Business Professional</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.SmallBusinessProfessional.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>SBA PCR</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.SBAPCR?.Title}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>PoP</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.SboDuration}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md="5" sm="12" xs="12">
                    <strong>Total Contract Value</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.ContractValueDollars}
                </Col>
            </Row>
            {props.process.ProcessType === ProcessTypes.DD2579 && <Row>
                <Col md="5" sm="12" xs="12">
                    <strong>Set-Aside Recommendation</strong>
                </Col>
                <Col md="7" sm="12" xs="12">
                    {props.process.SetAsideRecommendation}
                </Col>
            </Row>}
        </div>
    );
}