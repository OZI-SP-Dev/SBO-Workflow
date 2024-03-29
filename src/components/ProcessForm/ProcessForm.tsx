import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import {
  getBlankProcess,
  getNumbersOnly,
  IPerson,
  IProcess,
  ParentOrgs,
  Person,
  ProcessTypes,
  SetAsideRecommendations,
} from "../../api/DomainObjects";
import { OrgsContext } from "../../providers/OrgsContext";
import {
  IProcessValidation,
  ProcessValidation,
} from "../../utils/ProcessValidation";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./ProcessForm.css";
import { OLsContext } from "../../providers/OLsContext";

export interface IProcessFormProps {
  editProcess?: IProcess;
  processType: ProcessTypes;
  showModal: boolean;
  submitDisabled?: boolean;
  onShow?: () => void;
  handleClose: () => void;
  submit: (process: IProcess) => Promise<any>;
}

export const ProcessForm: FunctionComponent<IProcessFormProps> = (props) => {
  const [process, setProcess] = useState<IProcess>(
    props.editProcess
      ? { ...props.editProcess }
      : getBlankProcess(props.processType)
  );
  const [validation, setValidation] = useState<IProcessValidation>();

  const { ols, loading: olsLoading } = useContext(OLsContext);
  const { orgs, loading: orgsLoading } = useContext(OrgsContext);

  useEffect(() => {
    // Update validation whenever a field changes after a submission attempt
    if (validation) {
      setValidation(
        ProcessValidation.validateProcess(process, orgs ? orgs : [])
      );
    } // eslint-disable-next-line
  }, [process]);

  useEffect(() => {
    // Update the form's process whenever the props process changes
    if (props.editProcess) {
      setProcess({ ...props.editProcess });
    } // eslint-disable-next-line
  }, [props.editProcess]);

  const submitForm = async () => {
    let trimmedProcess = {
      ...process,
      SolicitationNumber: process.SolicitationNumber.trim(),
    };
    setProcess(trimmedProcess);
    const processValidation = ProcessValidation.validateProcess(
      process,
      orgs ? orgs : []
    );
    if (processValidation.IsErrored) {
      setValidation(processValidation);
    } else {
      await props.submit(trimmedProcess);
      closeForm();
    }
  };

  const closeForm = () => {
    setValidation(undefined);
    setProcess(
      props.editProcess
        ? { ...props.editProcess }
        : getBlankProcess(props.processType)
    );
    props.handleClose();
  };

  const updateContractValue = (input: string) => {
    if (input) {
      let periodIndex = input.indexOf(".");
      let cents: string =
        periodIndex > -1 ? input.substring(periodIndex + 1) : "";
      if (cents.length > 2) {
        cents = cents.substring(0, 2);
      }
      let number = `${input.substring(
        0,
        periodIndex > -1 ? periodIndex : undefined
      )}${periodIndex > -1 ? "." : ""}${cents}`;
      if (!isNaN(Number(number).valueOf())) {
        setProcess({ ...process, ContractValueDollars: number });
      }
    } else {
      setProcess({ ...process, ContractValueDollars: "" });
    }
  };

  return (
    <SubmittableModal
      modalTitle={
        (props.editProcess ? "Edit " : "Initiate ") +
        (props.processType === ProcessTypes.DD2579
          ? "Small Business Coordination Process (DD2579)"
          : "Individual Subcontracting Plan Process (ISP)")
      }
      show={props.showModal}
      size="lg"
      submitDisabled={props.submitDisabled}
      onShow={props.onShow}
      handleClose={closeForm}
      submit={submitForm}
    >
      <Form className="process-form">
        <Form.Group as={Row} controlId="formContractNumber">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Solicitation/Contract Number</strong>
            </Form.Label>
            <InfoTooltip id="solicitation">
              From Block 2 or 4 on DD2579
            </InfoTooltip>
          </Col>
          <Col xl="6">
            <Form.Control
              type="text"
              value={process.SolicitationNumber}
              onChange={(e) =>
                setProcess({ ...process, SolicitationNumber: e.target.value })
              }
              disabled={props.editProcess !== undefined}
              isInvalid={
                validation && validation.SolicitationNumberError !== ""
              }
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.SolicitationNumberError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formProgramName">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Program Name or Item Being Acquired</strong>
            </Form.Label>
            <InfoTooltip id="program-name">
              Short Description of Block 7a. on DD2579
            </InfoTooltip>
          </Col>
          <Col xl="6">
            <Form.Control
              type="text"
              value={process.ProgramName}
              onChange={(e) =>
                setProcess({ ...process, ProgramName: e.target.value })
              }
              isInvalid={validation && validation.ProgramNameError !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.ProgramNameError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formSBPControl">
          <Col xl="6">
            <Form.Label>
              <strong>SBP Control Number (optional)</strong>
            </Form.Label>
            <InfoTooltip id="sbp-control">For SBP use only</InfoTooltip>
          </Col>
          <Col xl="6">
            <Form.Control
              type="text"
              value={process.SBPControlNumber}
              onChange={(e) =>
                setProcess({ ...process, SBPControlNumber: e.target.value })
              }
            />
          </Col>
        </Form.Group>
        <fieldset>
          <Form.Group as={Row}>
            <Col xl="6">
              <Form.Label
                className="required"
                as="legend"
                style={{
                  fontSize: "1rem",
                  width: "fit-content",
                  float: "left",
                }}
              >
                <strong>Small Business Office</strong>
              </Form.Label>
              <InfoTooltip id="office">
                Center of your Small Business Specialist
              </InfoTooltip>
            </Col>
            <Col xl="6">
              {Object.values(ParentOrgs).map((org) => (
                <Form.Check
                  key={org}
                  inline
                  name="formSBO"
                  label={org}
                  type="radio"
                  id={`${org}-radio`}
                  checked={process.ParentOrg === org}
                  onChange={() => setProcess({ ...process, ParentOrg: org })}
                />
              ))}
            </Col>
          </Form.Group>
        </fieldset>

        <Form.Group as={Row} controlId="formOL">
          <Col xl="6">
            <Form.Label className="required">
              <strong>OL</strong>
            </Form.Label>
          </Col>
          <Col xl="6">
            <Form.Control
              as="select"
              value={process.OL ?? "WPAFB"}
              onChange={(e) => setProcess({ ...process, OL: e.target.value })}
              className="mr-sm-2"
            >
              {ols?.map(
                (ol) =>
                  !ol.Archived && <option key={ol.Title}>{ol.Title}</option>
              )}
            </Form.Control>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="formBuyerOrg">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Buyer's Organization</strong>
            </Form.Label>
          </Col>
          <Col xl="6">
            <Form.Control
              as="select"
              name="Org"
              value={process.Org}
              onChange={(e) => setProcess({ ...process, Org: e.target.value })}
              isInvalid={validation && validation.OrgError !== ""}
            >
              <option value="">--</option>
              {(orgs ? orgs : [])
                .filter((org) => org.ParentOrg === process.ParentOrg)
                .map((org) => (
                  <option key={org.Title}>{org.Title}</option>
                ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {validation ? validation.OrgError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formBuyer">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Buyer</strong>
            </Form.Label>
          </Col>
          <Col xl="6">
            <Form.Control
              as={PeoplePicker}
              defaultValue={process.Buyer.Title ? [process.Buyer] : []}
              updatePeople={(p: IPerson[]) => {
                let persona = p[0];
                setProcess({
                  ...process,
                  Buyer: persona ? new Person(persona) : new Person(),
                });
              }}
              required
              isInvalid={validation && validation.BuyerError !== ""}
              id="formBuyer"
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.BuyerError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formCO">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Contracting Officer</strong>
            </Form.Label>
          </Col>
          <Col xl="6">
            <Form.Control
              as={PeoplePicker}
              defaultValue={
                process.ContractingOfficer.Title
                  ? [process.ContractingOfficer]
                  : []
              }
              updatePeople={(p: IPerson[]) => {
                let persona = p[0];
                setProcess({
                  ...process,
                  ContractingOfficer: persona
                    ? new Person(persona)
                    : new Person(),
                });
              }}
              required
              isInvalid={
                validation && validation.ContractingOfficerError !== ""
              }
              id="formCO"
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.ContractingOfficerError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formSBP">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Small Business Professional</strong>
            </Form.Label>
          </Col>
          <Col xl="6">
            <Form.Control
              as={PeoplePicker}
              defaultValue={
                process.SmallBusinessProfessional.Title
                  ? [process.SmallBusinessProfessional]
                  : []
              }
              updatePeople={(p: IPerson[]) => {
                let persona = p[0];
                setProcess({
                  ...process,
                  SmallBusinessProfessional: persona
                    ? new Person(persona)
                    : new Person(),
                });
              }}
              required
              isInvalid={
                validation && validation.SmallBusinessProfessionalError !== ""
              }
              id="formSBP"
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.SmallBusinessProfessionalError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formPOP">
          <Col xl="6">
            <Form.Label className="required">
              <strong>PoP (months, including options)</strong>
            </Form.Label>
            <InfoTooltip id="pop">Agrees with DD2579 Block 8</InfoTooltip>
          </Col>
          <Col xl="6">
            <Form.Control
              type="number"
              value={process.SboDuration ? process.SboDuration : undefined}
              onChange={(e) =>
                setProcess({
                  ...process,
                  SboDuration: parseInt(getNumbersOnly(e.target.value)),
                })
              }
              isInvalid={validation && validation.SboDurationError !== ""}
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.SboDurationError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formContractValue">
          <Col xl="6">
            <Form.Label className="required">
              <strong>Total Contract Value (Including Option)</strong>
            </Form.Label>
            <InfoTooltip id="contract-value">
              Agrees with DD2579 Block 3
            </InfoTooltip>
          </Col>
          <Col xl="6">
            <Form.Control
              type="text"
              value={"$" + process.ContractValueDollars}
              // check if the dollar sign is there in case the tabbed into the field and it erased it
              onChange={(e) =>
                updateContractValue(
                  e.target.value.startsWith("$")
                    ? e.target.value.substr(1)
                    : e.target.value
                )
              }
              isInvalid={
                validation && validation.ContractValueDollarsError !== ""
              }
            />
            <Form.Control.Feedback type="invalid">
              {validation ? validation.ContractValueDollarsError : ""}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
        {props.processType === ProcessTypes.DD2579 && (
          <>
            <Form.Group as={Row} controlId="formSetAsideRecommendation">
              <Col xl="6">
                <Form.Label className="required">
                  <strong>Set-Aside Recommendation</strong>
                </Form.Label>
                <InfoTooltip id="set-aside">
                  Agrees with DD2579 Block 10
                </InfoTooltip>
              </Col>
              <Col xl="6">
                <Form.Control
                  as="select"
                  name="SetAsideRecommendation"
                  value={process.SetAsideRecommendation}
                  onChange={(e) =>
                    setProcess({
                      ...process,
                      SetAsideRecommendation: Object.values(
                        SetAsideRecommendations
                      ).find((s) => s === e.target.value),
                    })
                  }
                  isInvalid={
                    validation && validation.SetAsideRecommendationError !== ""
                  }
                >
                  <option value="">--</option>
                  {Object.values(SetAsideRecommendations).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {validation ? validation.SetAsideRecommendationError : ""}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
            <fieldset>
              <Form.Group as={Row}>
                <Col xl="6">
                  <Form.Label
                    className="required"
                    as="legend"
                    style={{ fontSize: "1rem" }}
                  >
                    <strong>Muliple-Award</strong>
                  </Form.Label>
                </Col>
                <Col xl="6">
                  <Form.Check
                    inline
                    type="radio"
                    id="award-radio-yes"
                    name="formMultipleAward"
                    checked={process.MultipleAward}
                    onChange={() =>
                      setProcess({ ...process, MultipleAward: true })
                    }
                    label="Yes"
                    className="mr-3"
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="award-radio-no"
                    name="formMultipleAward"
                    checked={!process.MultipleAward}
                    onChange={() =>
                      setProcess({ ...process, MultipleAward: false })
                    }
                    label="No"
                  />
                </Col>
              </Form.Group>
            </fieldset>
          </>
        )}
      </Form>
      <SBOSpinner show={orgsLoading !== false} displayText="Loading Orgs..." />
      <SBOSpinner show={olsLoading !== false} displayText="Loading OLs..." />
    </SubmittableModal>
  );
};
