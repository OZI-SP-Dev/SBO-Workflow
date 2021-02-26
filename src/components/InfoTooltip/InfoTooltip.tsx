import { Icon } from "@fluentui/react";
import React, { FunctionComponent, ReactElement } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import './InfoTooltip.css';

export interface InfoTooltipProps {
    id: string,
    trigger?: ReactElement,
    onClick?: () => void
}

export const InfoTooltip: FunctionComponent<InfoTooltipProps> = props => {

    return (
        <OverlayTrigger
            delay={{ show: 500, hide: 0 }}
            overlay={
                <Tooltip id={`${props.id}-infoTooltip`}>
                    {props.children}
                </Tooltip>
            }>
            {props.trigger ? props.trigger : <Icon onClick={props.onClick} iconName='Info' ariaLabel="Info" className="ml-1 align-middle info-tooltip-icon" />}
        </OverlayTrigger>
    );
}