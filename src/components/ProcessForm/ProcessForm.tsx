import { FunctionComponent, useState } from "react";
import { Form } from "react-bootstrap";
import { getBlankProcess, IProcess, ParentOrgs, ProcessTypes } from "../../api/DomainObjects";

export interface IProcessFormProps {
    processType: ProcessTypes
}

export const ProcessForm: FunctionComponent<IProcessFormProps> = (props) => {

    const [process, setProcess] = useState<IProcess>(getBlankProcess(props.processType));

    return (
        <Form>
            <Form.Label className="required">Solicitation/Contract Number</Form.Label>
            <Form.Control
                type="text"
                value={process.SolicitationNumber}
                onChange={e => setProcess({ ...process, SolicitationNumber: e.target.value })}
            />
            <Form.Label className="required">Program Name or Item Being Acquired</Form.Label>
            <Form.Control
                type="text"
                value={process.ProgramName}
                onChange={e => setProcess({ ...process, ProgramName: e.target.value })}
            />
            <Form.Label>Small Business Office</Form.Label>
            {Object.values(ParentOrgs).map(org =>
                <Form.Check key={org} inline label={org} type="radio" id={`${org}-radio`}
                    checked={process.ParentOrg === org}
                    onChange={() => setProcess({ ...process, ParentOrg: org })}
                />)
            }
        </Form>
    );
}