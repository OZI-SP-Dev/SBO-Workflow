import React, { FunctionComponent } from "react";
import { Breadcrumb, Card } from "react-bootstrap";
import "./HeaderBreadcrumbs.css"

export interface IHeaderBreadcrumbProps {
    // if the href is undefined then that crumb will be 'active', which should be the last item
    crumbs: { crumbName: string, href?: string }[]
}

export const HeaderBreadcrumbs: FunctionComponent<IHeaderBreadcrumbProps> = (props) => {

    return (
        <Card className="sbo-gray-gradiant mt-3">
            <Breadcrumb>
                {props.crumbs.map(crumb => <Breadcrumb.Item key={crumb.crumbName} href={crumb.href} active={crumb.href === undefined}>{crumb.crumbName}</Breadcrumb.Item>)}
            </Breadcrumb>
        </Card>
    );
}