import React, { FunctionComponent, useEffect } from "react";


export const RouteParamRedirect: FunctionComponent = () => {

    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get("route");

    useEffect(() => {
        if (routeParam) { // decode the URL encoding as the browser doesn't seem to do it for us
            window.location.replace(`${window.location.origin}${window.location.pathname}${decodeURIComponent(routeParam)}`);
        }
    }, [routeParam]);

    return (
        <></>
    );
}