import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useState } from "react";
import { Button } from "react-bootstrap";
import { FilterField, FilterValue } from "../../api/ProcessesApi";
import { PeoplePickerFilterPopover } from "../Popover/PeoplePickerFilterPopover";

export interface PeoplePickerFilterProps {
  iconClassName?: string;
  active: boolean;
  field: FilterField;
  title: string;
  addFilter(fieldName: FilterField, filterValue: FilterValue): void;
  clearFilter(fieldName: FilterField): void;
}

export const PeoplePickerFilter: FunctionComponent<PeoplePickerFilterProps> = (
  props
) => {
  const [show, setShow] = useState<boolean>(false);
  const [target, setTarget] = useState<any>();

  const iconOnClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    setShow(true);
    setTarget(e.target);
  };

  return (
    <>
      <PeoplePickerFilterPopover
        show={show}
        target={target}
        titleText={props.title}
        placement="bottom"
        onSubmit={(filterValue: FilterValue) =>
          props.addFilter(props.field, filterValue)
        }
        clearFilter={() => props.clearFilter(props.field)}
        handleClose={() => setShow(false)}
      />
      <Button
        variant="outline-primary"
        className="ml-auto th-button"
        onClick={iconOnClick}
        size="sm"
        aria-label={"Filter on " + props.title}
      >
        <Icon
          iconName="FilterSolid"
          className={`field-filter-button ${
            props.active ? "active-filter-icon" : ""
          } ${props.iconClassName}`}
        />
      </Button>
    </>
  );
};
