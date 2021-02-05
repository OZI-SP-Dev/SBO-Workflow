import { createContext, useState } from "react";

export interface IErrorsContext {
    errors: string[],
    reportError(error: Error | string): void,
    dismissError(error: string): void
}

export const ErrorsContext = createContext<Partial<IErrorsContext>>({ errors: [] });
export const ErrorsProvider: React.FunctionComponent = ({ children }) => {
    const [errors, setErrors] = useState<string[]>([]);

    const reportError = (error: Error | string) => {
        let newErrors = [...errors];
        newErrors.push(error instanceof Error ? error.message : error);
        setErrors(newErrors);
    }

    const dismissError = (error: string) => {
        let filteredErrors = errors;
        setErrors(filteredErrors.filter(e => e !== error));
    }

    const errorsContext: IErrorsContext = {
        errors,
        reportError,
        dismissError
    }

    return (<ErrorsContext.Provider value={errorsContext}>{children}</ErrorsContext.Provider>)
};

export const { Consumer } = ErrorsContext