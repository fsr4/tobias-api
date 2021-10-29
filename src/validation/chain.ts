import validator from "validator";

export const OPTIONAL = "optional";
export const IS_STRING = "isString";

export enum ValidationType {
    BODY = "body",
    QUERY = "query",
    PARAM = "param"
}

export type Validator = (value: string) => boolean;

export class ValidationChain {
    readonly type: ValidationType;
    readonly parameterName: string;
    readonly validators: Array<string | Validator>;

    constructor(type: ValidationType, parameterName: string) {
        this.type = type;
        this.parameterName = parameterName;
        this.validators = [];
    }

    public optional(): ValidationChain {
        this.validators.push(OPTIONAL);
        return this;
    }

    public isString(): ValidationChain {
        this.validators.push(IS_STRING);
        return this;
    }

    public custom(validator: Validator): ValidationChain {
        this.validators.push(validator);
        return this;
    }
}

// Add validator's validation methods (methods starting with "is") to the ValidationChain class
for (const func of Object.keys(validator)) {
    if (/^is[A-Z]/.test(func)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ValidationChain.prototype[func] = function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.validators.push(func);
            return this;
        };
    }
}
