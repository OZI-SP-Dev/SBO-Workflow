
export class InternalError implements Error {
    name: string = "InternalError";
    message: string;
    stack?: string | undefined;

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