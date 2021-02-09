import React, { FunctionComponent, useContext } from "react";
import { Alert } from "react-bootstrap";
import { ErrorsContext } from "../../providers/ErrorsContext";
import './ErrorList.css';

export const ErrorList: FunctionComponent = () => {

    const errorsContext = useContext(ErrorsContext);

    const closeError = (index: number) => {
        if (errorsContext.dismissError) {
            errorsContext.dismissError(index)
        }
    }

    return (

        <div className="sbo-errors">
            {errorsContext.errors?.map((e, i) =>
                <Alert key={i} dismissible className="mb-1" onClose={() => closeError(i)} variant="danger">
                    {e}
                </Alert>)
            }
        </div>
    );
}