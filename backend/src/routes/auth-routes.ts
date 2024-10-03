import express from 'express';
import { login, register } from '../controllers/auth-controller';
import { isRequiredString } from '../lib/is-required-string';

const router = express.Router();

router.post(
    '/register',
    [
        isRequiredString('fullName'),
        isRequiredString('username'),
        isRequiredString('email').isEmail().withMessage('Email is not valid'),
        isRequiredString('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    register
);

router.post(
    '/login',
    [
        isRequiredString('email').isEmail().withMessage('Email is not valid'),
        isRequiredString('password'),
    ],
    login
);

export default router;
