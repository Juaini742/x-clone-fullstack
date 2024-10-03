import { body, ValidationChain } from 'express-validator';

export const isRequiredString = (field: string): ValidationChain => {
    return body(field)
        .notEmpty()
        .withMessage(`${field} is required`)
        .isString()
        .withMessage(`${field} must be a string`);
};
