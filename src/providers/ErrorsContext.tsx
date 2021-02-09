import { createContext, useState } from "react";
import { InternalError } from "../api/InternalErrors";

export interface IErrorsContext {
    errors: string[],
    reportError(error: InternalError): void,
    dismissError(index: number): void
}

export const ErrorsContext = createContext<Partial<IErrorsContext>>({ errors: [] });
export const ErrorsProvider: React.FunctionComponent = ({ children }) => {
    const [errors, setErrors] = useState<string[]>([]);

    const reportError = (error: InternalError) => {
        let newErrors = [...errors];
        newErrors.push(error.message);
        setErrors(newErrors);
    }

    const dismissError = (index: number) => {
        let filteredErrors = [...errors];
        filteredErrors.splice(index, 1)
        setErrors(filteredErrors);
    }

    const errorsContext: IErrorsContext = {
        errors,
        reportError,
        dismissError
    }

    return (<ErrorsContext.Provider value={errorsContext}>{children}</ErrorsContext.Provider>)
};

export const { Consumer } = ErrorsContext