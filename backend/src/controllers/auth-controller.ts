import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { fullName, username, email, password } = req.body;

        const existUser = await prisma.user.findFirst({ where: { email } });
        if (existUser) {
            res.status(400).json({ error: 'Email already exist' });
            return;
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                fullName,
                username,
                email,
                password: hashPassword,
            },
        });

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error('SECRET_KEY is not defined in the environment');
        }

        const token = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: '1h',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Login is successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        const user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        const matchPassword = await bcryptjs.compare(password, user.password);

        if (!matchPassword) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error('SECRET_KEY is not defined in the environment');
        }

        const token = jwt.sign({ id: user.id }, secretKey, {
            expiresIn: '1h',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Login is successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).user;
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            res.status(401).json('Unauthorized');
            return;
        }

        res.cookie('token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(0),
        });

        res.status(200).json('Logout successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};
