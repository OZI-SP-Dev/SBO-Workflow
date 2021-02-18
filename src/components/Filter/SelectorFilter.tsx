import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useState } from "react";
import { FilterField, FilterValue } from "../../api/ProcessesApi";
import { SelectorFilterPopover } from "../Popover/SelectorFilterPopover";

export interface SelectorFilterProps {
    active: boolean
    field: FilterField,
    title: string,
    values: string[],
    addFilter(fieldName: FilterField, filterValue: FilterValue): void,
    clearFilter(fieldName: FilterField): void
}

export const SelectorFilter: FunctionComponent<SelectorFilterProps> = (props) => {

    const [show, setShow] = useState<boolean>(false);
    const [target, setTarget] = useState<any>();

    const iconOnClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        setShow(true);
        setTarget(e.target);
    }

    return (
        <>
            <SelectorFilterPopover
                show={show}
                target={target}
                titleText={props.title}
                placement="bottom"
                values={props.values}
                onSubmit={(filterValue: FilterValue) => props.addFilter(props.field, filterValue)}
                clearFilter={() => props.clearFilter(props.field)}
                handleClose={() => setShow(false)}
            />
            <Icon iconName="FilterSolid" className={`field-filter-button ${props.active ? "active-filter-icon" : ""}`} onClick={iconOnClick} />
        </>
    );

}