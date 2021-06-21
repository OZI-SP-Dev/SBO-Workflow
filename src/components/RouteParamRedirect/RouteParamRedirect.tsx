import React, { FunctionComponent, useEffect } from "react";


export const RouteParamRedirect: FunctionComponent = () => {

    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get("route");

    useEffect(() => {
        console.log("out");
        if (routeParam) { // decode the URL encoding as the browser doesn't seem to do it for us
            console.log("in");
            window.location.replace(`${window.location.origin}${window.location.pathname}${routeParam.replace("%23", "#").replaceAll("%2F", "/")}`);
        }
    }, [routeParam]);

    return (
        <></>
    );
}