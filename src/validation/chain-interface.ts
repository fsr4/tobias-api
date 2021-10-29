import { ValidationType, Validator } from "./chain";

export interface ValidationChain {
    readonly type: ValidationType;
    readonly parameterName: string;
    readonly validators: string[];

    optional(): ValidationChain;
    isString(): ValidationChain;
    custom(validator: Validator): ValidationChain;

    // Validator validation methods
    isEmail(): ValidationChain
    isURL(): ValidationChain
    isMACAddress(): ValidationChain
    isIP(): ValidationChain
    isIPRange(): ValidationChain
    isFQDN(): ValidationChain
    isBoolean(): ValidationChain
    isIBAN(): ValidationChain
    isBIC(): ValidationChain
    isAlpha(): ValidationChain
    isAlphaLocales(): ValidationChain
    isAlphanumeric(): ValidationChain
    isAlphanumericLocales(): ValidationChain
    isNumeric(): ValidationChain
    isPassportNumber(): ValidationChain
    isPort(): ValidationChain
    isLowercase(): ValidationChain
    isUppercase(): ValidationChain
    isAscii(): ValidationChain
    isFullWidth(): ValidationChain
    isHalfWidth(): ValidationChain
    isVariableWidth(): ValidationChain
    isMultibyte(): ValidationChain
    isSemVer(): ValidationChain
    isSurrogatePair(): ValidationChain
    isInt(): ValidationChain
    isIMEI(): ValidationChain
    isFloat(): ValidationChain
    isFloatLocales(): ValidationChain
    isDecimal(): ValidationChain
    isHexadecimal(): ValidationChain
    isOctal(): ValidationChain
    isDivisibleBy(): ValidationChain
    isHexColor(): ValidationChain
    isRgbColor(): ValidationChain
    isHSL(): ValidationChain
    isISRC(): ValidationChain
    isMD5(): ValidationChain
    isHash(): ValidationChain
    isJWT(): ValidationChain
    isJSON(): ValidationChain
    isEmpty(): ValidationChain
    isLength(): ValidationChain
    isLocale(): ValidationChain
    isByteLength(): ValidationChain
    isUUID(): ValidationChain
    isMongoId(): ValidationChain
    isAfter(): ValidationChain
    isBefore(): ValidationChain
    isIn(): ValidationChain
    isCreditCard(): ValidationChain
    isIdentityCard(): ValidationChain
    isEAN(): ValidationChain
    isISIN(): ValidationChain
    isISBN(): ValidationChain
    isISSN(): ValidationChain
    isMobilePhone(): ValidationChain
    isMobilePhoneLocales(): ValidationChain
    isPostalCode(): ValidationChain
    isPostalCodeLocales(): ValidationChain
    isEthereumAddress(): ValidationChain
    isCurrency(): ValidationChain
    isBtcAddress(): ValidationChain
    isISO8601(): ValidationChain
    isRFC3339(): ValidationChain
    isISO31661Alpha2(): ValidationChain
    isISO31661Alpha3(): ValidationChain
    isBase32(): ValidationChain
    isBase58(): ValidationChain
    isBase64(): ValidationChain
    isDataURI(): ValidationChain
    isMagnetURI(): ValidationChain
    isMimeType(): ValidationChain
    isLatLong(): ValidationChain
    isWhitelisted(): ValidationChain
    isSlug(): ValidationChain
    isStrongPassword(): ValidationChain
    isTaxID(): ValidationChain
    isDate(): ValidationChain
    isLicensePlate(): ValidationChain
    isVAT(): ValidationChain
}
