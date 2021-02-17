import React, { FunctionComponent, useRef, useState } from "react";
import { Button, Overlay, Popover, Spinner } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/Overlay";
import { useOutsideClickDetect } from "../../hooks/useOutsideClickDetect";

export interface FilterPopoverProps {
    show: boolean,
    target: any,
    titleText: string,
    placement?: Placement,
    onSubmit: () => void,
    clearFilter: () => void,
    handleClose: () => void
}

export const FilterPopover: FunctionComponent<FilterPopoverProps> = (props) => {

    const wrapperRef = useRef(null);
    useOutsideClickDetect(wrapperRef, props.handleClose);

    const onSubmit = () => {
        props.onSubmit();
        props.handleClose();
    }

    const onClear = () => {
        props.clearFilter();
        props.handleClose();
    }

    return (
        <Overlay
            show={props.show}
            placement={props.placement}
            target={props.target}
        >
            <Popover id={"confirm-popover"}>
                <div ref={wrapperRef}>
                    <Popover.Title as="h5">{props.titleText}</Popover.Title>
                    <Popover.Content>
                        {props.children}
                        <Button
                            className="float-left mb-2"
                            variant="secondary"
                            onClick={onClear}
                        >
                            Clear
                        </Button>
                        <Button
                            className="float-right mb-2"
                            variant="primary"
                            onClick={onSubmit}
                        >
                            Filter
                        </Button>
                    </Popover.Content>
                </div>
            </Popover>
        </Overlay>
    );

}