import { Icon } from "@fluentui/react";
import React, { FunctionComponent } from "react";
import { FilterField } from "../../api/ProcessesApi";

export interface SortIconProps {
    field: FilterField,
    ascending: boolean,
    active: boolean,
    onClick: (field: FilterField) => void
}

export const SortIcon: FunctionComponent<SortIconProps> = (props) => {

    return (
        <Icon
            onClick={() => props.onClick(props.field)}
            iconName={props.ascending || !props.active ? "TriangleSolidUp12" : "TriangleSolidDown12"}
            className={"sort-icon" + (props.active ? " active-sort-icon" : "")}
        />
    );
}