import { Context, Middleware } from "koa";
import validator from "validator";
import { UnprocessableEntity } from "../util/errors/http-errors";
import { IS_STRING, OPTIONAL, ValidationChain, ValidationType } from "./chain";
import { ValidationChain as IValidationChain } from "./chain-interface";

export function body(parameterName: string): IValidationChain {
    return new ValidationChain(ValidationType.BODY, parameterName) as IValidationChain;
}

export function query(parameterName: string): IValidationChain {
    return new ValidationChain(ValidationType.QUERY, parameterName) as IValidationChain;
}

export function param(parameterName: string): IValidationChain {
    return new ValidationChain(ValidationType.PARAM, parameterName) as IValidationChain;
}

export function validate(...validationChains: IValidationChain[]): Middleware {
    return (ctx, next) => {
        const validationErrors = new Array<ValidationError>();

        for (const validationChain of validationChains) {
            let optionalFlag = false;
            for (const v of validationChain.validators) {
                // Check if optional flag should be set
                if (v === OPTIONAL) {
                    optionalFlag = true;
                    continue;
                }

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // Set val to custom function v or to validator with name v
                const val = typeof v === "function" ? v : validator[v];
                const value = getParameterValue(ctx, validationChain);

                // Skip if optional and value is undefined
                if (optionalFlag && value === undefined)
                    continue;

                // Check if validator is custom "isString"
                if (v === IS_STRING) {
                    if (!(typeof value === "string"))
                        validationErrors.push({
                            property: validationChain.parameterName,
                            type: validationChain.type,
                            failedValidation: v,
                        });
                    continue;
                }

                // Execute the validator
                if (!val.call(null, value + ""))
                    validationErrors.push({
                        property: validationChain.parameterName,
                        type: validationChain.type,
                        failedValidation: v,
                    });
            }

        }
        if (validationErrors.length !== 0)
            throw new UnprocessableEntity("Validation failed", validationErrors);

        return next();
    };
}

interface ValidationError {
    property: string;
    type: string;
    failedValidation: string;
}

function getParameterValue(ctx: Context, chain: ValidationChain): unknown {
    switch (chain.type) {
        case ValidationType.BODY:
            return ctx.request.body[chain.parameterName];
        case ValidationType.QUERY:
            return ctx.request.query[chain.parameterName];
        case ValidationType.PARAM:
            return ctx.params[chain.parameterName];
    }
}
