export abstract class ApiError {
    private readonly _statusCode: number;
    private readonly _status: string;
    private readonly _message: string | undefined;
    private readonly _details: unknown;

    protected constructor(statusCode: number, status: string, message?: string, details?: unknown) {
        this._statusCode = statusCode;
        this._status = status;
        this._message = message;
        this._details = details;
    }

    get statusCode(): number {
        return this._statusCode;
    }

    get message(): string {
        return this._message || this._status;
    }

    get details(): unknown {
        return this._details;
    }
}

export class NotFound extends ApiError {
    constructor(message?: string) {
        super(404, "Not Found", message);
    }
}

export class BadRequest extends ApiError {
    constructor(message: string) {
        super(400, "Bad Request", message);
    }
}

export class UnprocessableEntity extends ApiError {
    constructor(message: string, details: unknown) {
        super(422, "Unprocessable Entity", message, details);
    }
}
