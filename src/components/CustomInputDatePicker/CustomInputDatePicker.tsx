import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './CustomInputeDatePicker.css';

export interface ICustomInputeDatePickerProps {
    headerText: string,
    readOnly: boolean,
    date: DateTime | null,
    minDate?: DateTime,
    maxDate?: DateTime,
    isClearable?: boolean,
    required?: boolean,
    isValid?: boolean,
    isInvalid?: boolean,
    errorMessage?: string,
    onChange: (date: DateTime | null) => void
}

export const CustomInputeDatePicker: React.FunctionComponent<ICustomInputeDatePickerProps> = (props: ICustomInputeDatePickerProps) => {

    const [open, setOpen] = useState<boolean>(false);

    const onChange = (newDate: Date | null) => {
        if (!props.readOnly) {
            props.onChange(newDate ? DateTime.fromJSDate(newDate) : null);
        }
    }

    const onClick = (inside: boolean) => {
        if (!props.readOnly) {
            setOpen(inside);
        }
    }

    const DatePickerCustomInput = () => (
        <>
            <Form.Label className={`${props.required ? 'required' : ''}`}>{props.headerText}</Form.Label>
            <Form.Control
                type="text"
                readOnly={props.readOnly}
                defaultValue={props.date ? props.date.toFormat("dd LLL yyyy") : undefined}
                onClick={() => onClick(true)}
                isValid={props.isValid}
                isInvalid={props.isInvalid}
            />
            <Form.Control.Feedback type="invalid">
                {props.errorMessage}
            </Form.Control.Feedback>
        </>);

    return (
        <DatePicker
            selected={props.date ? props.date.toJSDate() : undefined}
            onChange={onChange}
            minDate={props.minDate ? props.minDate.toJSDate() : undefined}
            maxDate={props.maxDate ? props.maxDate.toJSDate() : undefined}
            customInput={<DatePickerCustomInput />}
            open={open}
            onClickOutside={() => onClick(false)}
            shouldCloseOnSelect={false}
            customInputRef="DatePickerCustomInput"
            isClearable={props.isClearable}
        />
    );
}