import { FunctionComponent, useState } from "react";
import { Form } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { FilterValue } from "../../api/ProcessesApi";
import { FilterPopover } from "./FilterPopover";


export interface SelectorFilterPopoverProps {
    show: boolean,
    target: any,
    titleText: string,
    placement?: Placement,
    values: string[],
    onSubmit: (filterValue: FilterValue) => void,
    clearFilter(): void,
    handleClose: () => void
}

export const SelectorFilterPopover: FunctionComponent<SelectorFilterPopoverProps> = (props) => {

    const [selected, setSelected] = useState<string>('');

    const onClear = () => {
        setSelected('');
        props.clearFilter();
    }

    return (
        <FilterPopover {...props} onSubmit={() => props.onSubmit(selected)} clearFilter={onClear}>
            <Form>
                <Form.Control as="select" value={selected} onChange={e => setSelected(e.target.value)}>
                    <option value=''>--</option>
                    {props.values.map(value =>
                        <option key={value}>{value}</option>
                    )}
                </Form.Control>
            </Form>
        </FilterPopover>
    );

}