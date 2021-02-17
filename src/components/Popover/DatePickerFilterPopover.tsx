import { DateTime } from "luxon";
import React, { FunctionComponent, useState } from "react";
import { Form } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { FilterValue } from "../../api/ProcessesApi";
import { CustomInputeDatePicker } from "../CustomInputDatePicker/CustomInputDatePicker";
import { FilterPopover } from "./FilterPopover";


export interface DatePickerFilterPopoverProps {
    show: boolean,
    target: any,
    titleText: string,
    placement?: Placement,
    onSubmit: (filterValue: FilterValue, isStartsWith?: boolean) => void,
    clearFilter(): void,
    handleClose: () => void
}

export const DatePickerFilterPopover: FunctionComponent<DatePickerFilterPopoverProps> = (props) => {

    const [startDate, setStartDate] = useState<DateTime | null>(null);
    const [endDate, setEndDate] = useState<DateTime | null>(null);

    return (
        <FilterPopover {...props} onSubmit={() => props.onSubmit({ start: startDate, end: endDate })}>
            <Form>
                <CustomInputeDatePicker
                    headerText="Start Date:"
                    readOnly={false}
                    date={startDate}
                    maxDate={DateTime.local()}
                    onChange={date => setStartDate(date)}
                />
                <CustomInputeDatePicker
                    headerText="End Date:"
                    readOnly={false}
                    date={endDate}
                    minDate={startDate ? startDate : undefined}
                    maxDate={DateTime.local()}
                    onChange={date => setEndDate(date)}
                />
            </Form>
        </FilterPopover>
    );

}