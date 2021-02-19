import { FunctionComponent, useContext, useState } from "react";
import { Form } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { IPerson, Person } from "../../api/DomainObjects";
import { FilterValue } from "../../api/ProcessesApi";
import { UserContext } from "../../providers/UserProvider";
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
    const { user } = useContext(UserContext);

    const onSubmit = () => {
        if (person) {
            props.onSubmit(person)
        }
    }

    const onClear = () => {
        setPerson(undefined);
        props.clearFilter();
    }

    const setUser = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setPerson(user);
        return false;
    }

    return (
        <FilterPopover {...props} onSubmit={onSubmit} clearFilter={onClear}>
            <Form>
                {user !== undefined &&
                    <div className="mb-2"><a href="#" onClick={setUser}>Filter by Me</a></div>
                }
                <Form.Control
                    as={PeoplePicker}
                    defaultValue={person ? [person] : undefined}
                    updatePeople={(p: IPerson[]) => setPerson(p.length > 0 ? new Person(p[0]) : undefined)}
                    required
                />
            </Form>
        </FilterPopover>
    );

}