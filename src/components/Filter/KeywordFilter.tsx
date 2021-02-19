import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useState } from "react";
import { FilterField, FilterValue } from "../../api/ProcessesApi";
import { KeywordFilterPopover } from "../Popover/KeywordFilterPopover";
import './Filter.css'

export interface KeywordFilterProps {
    iconClassName?: string,
    active: boolean
    field: FilterField,
    title: string,
    addFilter(fieldName: FilterField, filterValue: FilterValue, isStartsWith?: boolean): void,
    clearFilter(fieldName: FilterField): void
}

export const KeywordFilter: FunctionComponent<KeywordFilterProps> = (props) => {

    const [show, setShow] = useState<boolean>(false);
    const [target, setTarget] = useState<any>();

    const iconOnClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        setShow(true);
        setTarget(e.target);
    }

    return (
        <>
            <KeywordFilterPopover
                show={show}
                target={target}
                titleText={props.title}
                placement="bottom"
                onSubmit={(filterValue: FilterValue) => props.addFilter(props.field, filterValue)}
                clearFilter={() => props.clearFilter(props.field)}
                handleClose={() => setShow(false)}
            />
            <Icon iconName="FilterSolid" className={`field-filter-button ${props.active ? "active-filter-icon" : ""} ${props.iconClassName}`} onClick={iconOnClick} />
        </>
    );

}