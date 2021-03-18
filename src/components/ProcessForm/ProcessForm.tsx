import React, { FunctionComponent, useContext, useEffect, useState } from "react";
import { Col, Form } from "react-bootstrap";
import { getBlankProcess, IPerson, IProcess, ParentOrgs, Person, ProcessTypes, SetAsideRecommendations } from "../../api/DomainObjects";
import { OrgsContext } from "../../providers/OrgsContext";
import { IProcessValidation, ProcessValidation } from "../../utils/ProcessValidation";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./ProcessForm.css";

export interface IProcessFormProps {
    editProcess?: IProcess,
    processType: ProcessTypes,
    showModal: boolean,
    handleClose: () => void,
    submit: (process: IProcess) => Promise<any>
}

export const ProcessForm: FunctionComponent<IProcessFormProps> = (props) => {

    const [process, setProcess] = useState<IProcess>(props.editProcess ? { ...props.editProcess } : getBlankProcess(props.processType));
    const [validation, setValidation] = useState<IProcessValidation>();

    const { orgs, loading: orgsLoading } = useContext(OrgsContext);

    useEffect(() => {
        // Update validation whenever a field changes after a submission attempt
        if (validation) {
            setValidation(ProcessValidation.validateProcess(process, orgs ? orgs : []));
        } // eslint-disable-next-line
    }, [process]);

    useEffect(() => {
        // Update the form's process whenever the props process changes
        if (props.editProcess) {
            setProcess({ ...props.editProcess });
        } // eslint-disable-next-line
    }, [props.editProcess]);

    const getNumbersOnly = (input: string): string => {
        return input.replaceAll(new RegExp("[^0-9]", 'g'), "");
    }

    const updateTotalContractValue = (input: string): void => {
        let numbers = getNumbersOnly(input);
        let dollars: string = getNumbersOnly(numbers.substring(0, numbers.length - 2));
        while (dollars[0] === '0') {
            dollars = dollars.substring(1);
        }
        let cents: string = getNumbersOnly(numbers.substring(numbers.length - 2));
        if (dollars.length <= 13) {
            if (dollars.length > 3) {
                let commaIndex: number = dollars.length - 3;
                while (commaIndex > 0) {
                    dollars = dollars.substring(0, commaIndex) + ',' + dollars.substring(commaIndex);
                    commaIndex -= 3;
                }
            }
            setProcess({ ...process, ContractValueDollars: (`$${dollars}.${cents}`) });
        }
    }

    const submitForm = async () => {
        const processValidation = ProcessValidation.validateProcess(process, orgs ? orgs : []);
        if (processValidation.IsErrored) {
            setValidation(processValidation);
        } else {
            await props.submit(process);
            closeForm();
        }
    }

    const closeForm = () => {
        setValidation(undefined);
        setProcess(props.editProcess ? { ...props.editProcess } : getBlankProcess(props.processType));
        props.handleClose();
    }

    return (
        <SubmittableModal
            modalTitle={(props.editProcess ? "Edit " : "Initiate ") + (props.processType === ProcessTypes.DD2579 ? "Small Business Coordination Process (DD2579)" : "Individual Subcontracting Plan Process (ISP)")}
            show={props.showModal}
            size="lg"
            handleClose={closeForm}
            submit={submitForm}
        >
            <Form className="process-form">
                <Form.Row>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Solicitation/Contract Number</strong></Form.Label>
                        <InfoTooltip id="solicitation">From Block 2 or 4 on DD2579</InfoTooltip>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="text"
                            value={process.SolicitationNumber}
                            onChange={e => setProcess({ ...process, SolicitationNumber: e.target.value })}
                            disabled={props.editProcess !== undefined}
                            isInvalid={validation && validation.SolicitationNumberError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.SolicitationNumberError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Program Name or Item Being Acquired</strong></Form.Label>
                        <InfoTooltip id="program-name">Short Description of Block 7a. on DD2579</InfoTooltip>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="text"
                            value={process.ProgramName}
                            onChange={e => setProcess({ ...process, ProgramName: e.target.value })}
                            isInvalid={validation && validation.ProgramNameError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.ProgramNameError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label><strong>SBP Control Number (optional)</strong></Form.Label>
                        <InfoTooltip id="sbp-control">For SBP use only</InfoTooltip>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="text"
                            value={process.SBPControlNumber}
                            onChange={e => setProcess({ ...process, SBPControlNumber: e.target.value })}
                        />
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Small Business Office</strong></Form.Label>
                        <InfoTooltip id="office">Center of your Small Business Specialist</InfoTooltip>
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
                        <Form.Label className="required"><strong>Buyer's Organization</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as="select"
                            value={process.Org}
                            onChange={e => setProcess({ ...process, Org: e.target.value })}
                            isInvalid={validation && validation.OrgError !== ""}
                        >
                            <option value=''>--</option>
                            {(orgs ? orgs : [])
                                .filter(org => org.ParentOrg === process.ParentOrg)
                                .map(org => <option key={org.Title}>{org.Title}</option>)}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.OrgError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Buyer</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            defaultValue={process.Buyer.Title ? [process.Buyer] : []}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, Buyer: persona ? new Person(persona) : new Person() });
                            }}
                            required
                            isInvalid={validation && validation.BuyerError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.BuyerError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Contracting Officer</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            defaultValue={process.ContractingOfficer.Title ? [process.ContractingOfficer] : []}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, ContractingOfficer: persona ? new Person(persona) : new Person() });
                            }}
                            required
                            isInvalid={validation && validation.ContractingOfficerError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.ContractingOfficerError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Small Business Professional</strong></Form.Label>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            as={PeoplePicker}
                            defaultValue={process.SmallBusinessProfessional.Title ? [process.SmallBusinessProfessional] : []}
                            updatePeople={(p: IPerson[]) => {
                                let persona = p[0];
                                setProcess({ ...process, SmallBusinessProfessional: persona ? new Person(persona) : new Person() });
                            }}
                            required
                            isInvalid={validation && validation.SmallBusinessProfessionalError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.SmallBusinessProfessionalError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>PoP (months, including options)</strong></Form.Label>
                        <InfoTooltip id="pop">Agrees with DD2579 Block 8</InfoTooltip>
                    </Col>
                    <Col xl="6">
                        <Form.Control
                            type="number"
                            value={process.SboDuration ? process.SboDuration : undefined}
                            onChange={e => setProcess({ ...process, SboDuration: parseInt(getNumbersOnly(e.target.value)) })}
                            isInvalid={validation && validation.SboDurationError !== ""}
                        />
                        <Form.Control.Feedback type="invalid">
                            {validation ? validation.SboDurationError : ""}
                        </Form.Control.Feedback>
                    </Col>
                    <Col xl="6">
                        <Form.Label className="required"><strong>Total Contract Value (Including Option)</strong></Form.Label>
                        <InfoTooltip id="contract-value">Agrees with DD2579 Block 3</InfoTooltip>
                    </Col>
                    <Col xl="6">
                        <Form.Group>
                            <Form.Control
                                type="text"
                                value={process.ContractValueDollars}
                                onChange={e => updateTotalContractValue(e.target.value)}
                                isInvalid={validation && validation.ContractValueDollarsError !== ""}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validation ? validation.ContractValueDollarsError : ""}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {props.processType === ProcessTypes.DD2579 && <>
                        <Col xl="6">
                            <Form.Label className="required"><strong>Set-Aside Recommendation</strong></Form.Label>
                            <InfoTooltip id="set-aside">Agrees with DD2579 Block 10</InfoTooltip>
                        </Col>
                        <Col xl="6">
                            <Form.Control
                                as="select"
                                value={process.SetAsideRecommendation}
                                onChange={e => setProcess({ ...process, SetAsideRecommendation: Object.values(SetAsideRecommendations).find(s => s === e.target.value) })}
                                isInvalid={validation && validation.SetAsideRecommendationError !== ""}
                            >
                                <option value=''>--</option>
                                {Object.values(SetAsideRecommendations).map(type => <option key={type}>{type}</option>)}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {validation ? validation.SetAsideRecommendationError : ""}
                            </Form.Control.Feedback>
                        </Col>
                        <Col xl="6">
                            <Form.Label className="required"><strong>Muliple-Award</strong></Form.Label>
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
            <SBOSpinner show={orgsLoading !== false} displayText="Loading Orgs..." />
        </SubmittableModal >
    );
}