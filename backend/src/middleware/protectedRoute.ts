import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protectedRoutes = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies['token'];
        if (!token) {
            return res.status(401).json('Unauthorized');
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error('SECRET_KEY is not defined in the environment');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secretKey, {
                ignoreExpiration: false,
            }) as { id?: string };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                res.cookie('token', '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    expires: new Date(0),
                    sameSite: 'none',
                });
                return res
                    .status(401)
                    .json({ message: 'Unauthorized: Token expired' });
            }
            return res
                .status(401)
                .json({ message: 'Unauthorized: Invalid token' });
        }

        if (!decoded.id) {
            return res
                .status(400)
                .json({ message: 'Invalid token: No user ID found' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        (req as any).user = user;

        next();
    } catch (error) {
        return next(error);
    }
};
