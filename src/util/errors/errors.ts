export class InvalidDatabaseContentError extends Error {
    constructor() {
        super("invalid database content");
    }
}

export class InvalidOperationError extends Error {
    constructor(message?: string) {
        super(message ?? "invalid operation");
    }
}

export class InvalidApplicationStateError extends Error {
    constructor(message?: string) {
        super(message ?? "invalid application state");
    }
}
