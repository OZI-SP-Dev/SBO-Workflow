
export interface SPError {
    error: {
        code: string,
        message: {
            lang: "en-US" | string,
            value: string
        }
    }
}

export class InternalError implements Error {
    name: string = "InternalError";
    message: string;
    stack?: string;

    constructor(e?: Error | string, message?: string) {
        if (e && e instanceof Error) {
            this.message = message ? message : e.message;
            this.stack = e.stack;
        } else {
            this.message = message ? message : e ? e : "An unknown error occurred internally!";
        }
    }
}

export class ApiError extends InternalError {
    name: string = "ApiError";

    constructor(e?: Error | string, message?: string) {
        super(e ? e : "An unknown error occurred while communicating with SharePoint!", message);
    }
}

export class NotAuthorizedError extends InternalError {
    name: string = "NotAuthorizedError";

    constructor(e?: Error | string, message?: string) {
        super(e ? e : "You are not authorized to do this!", message);
    }
}

export class DuplicateEntryError extends InternalError {
    name: string = "DuplicateEntryError";

    constructor(e?: Error | string, message?: string) {
        super(e ? e : "You cannot submit a duplicate entry!", message);
    }
}

export class PrematureActionError extends InternalError {
    name: string = "PrematureActionError";

    constructor(e?: Error | string, message?: string) {
        super(e ? e : "You cannot take this action before we're done loading the data!", message);
    }
}

export class InputError extends InternalError {
    name: string = "InputError";

    constructor(e?: Error | string, message?: string) {
        super(e ? e : "There was a problem with the input you provided!", message);
    }
}

export const parseSPError = (e: Error | string): SPError | undefined => {
    if (e instanceof Error && e.message.includes("::> {")) {
        return JSON.parse(e.message.substring(e.message.indexOf("::> {") + 3));
    } else if (typeof (e) === "string" && e.includes("::> {")) {
        return JSON.parse(e.substring(e.indexOf("::> {") + 3));
    }
}

export const getAPIError = (e: any, baseMessage: string): InternalError => {
    console.error(baseMessage);
    console.error(e);
    const spError = parseSPError(e);
    if (spError) {
        return new ApiError(e, `${baseMessage}: ${spError.error.message.value}`)
    } else if (e instanceof InternalError) {
        return e;
    } else if (e instanceof Error) {
        return new ApiError(e, `${baseMessage}: ${e.message}`);
    } else if (typeof (e) === "string") {
        return new ApiError(`${baseMessage}: ${e}`);
    } else {
        return new ApiError(baseMessage);
    }
}