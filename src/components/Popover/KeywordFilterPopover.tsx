import { FunctionComponent, useState } from "react";
import { Form } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { FilterValue } from "../../api/ProcessesApi";
import { FilterPopover } from "./FilterPopover";


export interface KeywordFilterPopoverProps {
    show: boolean,
    target: any,
    titleText: string,
    placement?: Placement,
    onSubmit: (filterValue: FilterValue, isStartsWith?: boolean) => void,
    clearFilter(): void,
    handleClose: () => void
}

export const KeywordFilterPopover: FunctionComponent<KeywordFilterPopoverProps> = (props) => {

    const [keyword, setKeyword] = useState<string>('');
    const [isStartsWith, setIsStartsWith] = useState<boolean>(false);

    const onClear = () => {
        setKeyword('');
        setIsStartsWith(false);
        props.clearFilter();
    }

    return (
        <FilterPopover {...props} onSubmit={() => props.onSubmit(keyword, isStartsWith)} clearFilter={onClear}>
            <Form>
                <Form.Check
                    type="radio"
                    id="contains-radio"
                    label="Contains"
                    checked={!isStartsWith}
                    onChange={() => setIsStartsWith(false)}
                />
                <Form.Check
                    type="radio"
                    id="starts-with-radio"
                    label="Starts With"
                    checked={isStartsWith}
                    onChange={() => setIsStartsWith(true)}
                />
                <Form.Control
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </Form>
        </FilterPopover>
    );

}