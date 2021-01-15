import React, { FunctionComponent, useState } from "react";
import { Col, Form } from "react-bootstrap";
import { getBlankProcess, IPerson, IProcess, ParentOrgs, Person, ProcessTypes, SetAsideRecommendations } from "../../api/DomainObjects";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./ProcessForm.css"

export interface IProcessFormProps {
    processType: ProcessTypes,
    showModal: boolean,
    handleClose: () => void,
    submit: (process: IProcess) => Promise<any>
}

export const ProcessForm: FunctionComponent<IProcessFormProps> = (props) => {

    const [process, setProcess] = useState<IProcess>(getBlankProcess(props.processType));

    const getNumbersOnly = (input: string): string => {
        return input.replaceAll(new RegExp("[^0-9]", 'g'), "");
    }

    const getCurrency = (input: string): string => {
        let currency: string = getNumbersOnly(input);
        if (currency.length > 3) {
            let commaIndex: number = currency.length - 3;
            while (commaIndex > 0) {
                currency = currency.substring(0, commaIndex) + ',' + currency.substring(commaIndex);
                commaIndex -= 3;
            }
        }
        return '$' + currency;
    }

    const closeForm = () => {
        props.handleClose();
        setProcess(getBlankProcess(props.processType));
    }

    return (
        <SubmittableModal
            modalTitle={props.processType === ProcessTypes.DD2579 ? "Initiate Small Business Coordination Process (DD2579)" : "Initiate Individual Subcontracting Plan Process (ISP)"}
            show={props.showModal}
            size="lg"
            handleClose={closeForm}
            submit={() => props.submit(process).then(closeForm)}
        >
            <Form className="process-form">
                <Form.Row>
                    <Col xl="6">
                        <Form.Label><strong>Solicitation/Contract Number</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="text"
                            value={process.SolicitationNumber}
                            onChange={e => setProcess({ ...process, SolicitationNumber: e.target.value })}
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label><strong>Program Name or Item Being Acquired</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="text"
                            value={process.ProgramName}
                            onChange={e => setProcess({ ...process, ProgramName: e.target.value })}
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label><strong>Small Business Office</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        {Object.values(ParentOrgs).map(org =>
                            <Form.Check key={org} inline label={org} type="radio" id={`${org}-radio`}
                                checked={process.ParentOrg === org}
                                onChange={() => setProcess({ ...process, ParentOrg: org })}
                            />)
                        }
                    </Col>
                    <Col xl="6">
                        <Form.Label><strong>Buyer's Organization</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as="select"
                            value={process.Org}
                            onChange={e => setProcess({ ...process, Org: e.target.value })}
                        >
                            <option value=''>--</option>
                            {["OZI", "OZJ", "OZA"].map(type => <option key={type}>{type}</option>)}
                        </Form.Control>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Buyer</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, Buyer: persona ? new Person(persona) : new Person() });
                            }}
                            required
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Contracting Officer</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, ContractingOfficer: persona ? new Person(persona) : new Person() });
                            }}
                            required
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Small Business Professional</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, SmallBusinessProfessional: persona ? new Person(persona) : new Person() });
                            }}
                            required
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>PoP (months, including options)</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="number"
                            value={process.SboDuration ? process.SboDuration : undefined}
                            onChange={e => setProcess({ ...process, SboDuration: parseInt(getNumbersOnly(e.target.value)) })}
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Total Contract Value (Including Option)</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Group>
                            <Form.Control
                                type="text"
                                value={process.ContractValueDollars}
                                onChange={e => setProcess({ ...process, ContractValueDollars: getCurrency(e.target.value) })}
                            />
                        </Form.Group>
                    </Col>
                    {props.processType === ProcessTypes.DD2579 && <>
                        <Col xl="6">
                            <Form.Label><strong>Set-Aside Recommendation</strong></Form.Label>
                        </Col>
                        <Col xl="6">
                            <Form.Control
                                as="select"
                                value={process.SetAsideRecommendation}
                                onChange={e => setProcess({ ...process, SetAsideRecommendation: Object.values(SetAsideRecommendations).find(s => s === e.target.value) })}
                            >
                                <option value=''>--</option>
                                {Object.values(SetAsideRecommendations).map(type => <option key={type}>{type}</option>)}
                            </Form.Control>
                        </Col>
                        <Col xl="6">
                            <Form.Label className="mr-3 required"><strong>Muliple-Award</strong></Form.Label>
                        </Col>
                        <Col xl="6">
                            <Form.Check inline type="radio">
                                <Form.Group controlId="award-radio">
                                    <Form.Check.Input type="radio"
                                        id="award-radio-yes"
                                        checked={process.MultipleAward}
                                        onChange={() => setProcess({ ...process, MultipleAward: true })}
                                    />
                                    <Form.Check.Label htmlFor="award-radio-yes" className="mr-3">Yes</Form.Check.Label>
                                    <Form.Check.Input type="radio"
                                        id="award-radio-no"
                                        checked={!process.MultipleAward}
                                        onChange={() => setProcess({ ...process, MultipleAward: false })}
                                    />
                                    <Form.Check.Label htmlFor="award-radio-no" className="mr-3">No</Form.Check.Label>
                                </Form.Group>
                            </Form.Check>
                        </Col>
                    </>}
                </Form.Row>
            </Form>
        </SubmittableModal >
    );
}