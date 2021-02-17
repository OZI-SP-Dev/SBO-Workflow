import { FunctionComponent, useState } from "react";
import { Form } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { IPerson, Person } from "../../api/DomainObjects";
import { FilterValue } from "../../api/ProcessesApi";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import { FilterPopover } from "./FilterPopover";


export interface PeoplePickerFilterPopoverProps {
    show: boolean,
    target: any,
    titleText: string,
    placement?: Placement,
    onSubmit: (filterValue: FilterValue) => void,
    clearFilter(): void,
    handleClose: () => void
}

export const PeoplePickerFilterPopover: FunctionComponent<PeoplePickerFilterPopoverProps> = (props) => {

    const [person, setPerson] = useState<IPerson>();

    const onSubmit = () => {
        if (person) {
            props.onSubmit(person)
        }
    }

    return (
        <FilterPopover {...props} onSubmit={onSubmit}>
            <Form>
                <Form.Control
                    as={PeoplePicker}
                    updatePeople={(p: IPerson[]) => {
                        let persona = p[0];
                        if (persona) {
                            setPerson(new Person(persona));
                        }
                    }}
                    required
                />
            </Form>
        </FilterPopover>
    );

}