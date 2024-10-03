import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getNotification = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: userId } = (req as any).user;

        const notifications = await prisma.notification.findMany({
            where: { toUserId: userId },
            include: {
                user_notification_fromUserIdTouser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profileImg: true,
                    },
                },
            },
        });

        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notifications.map((notification) => notification.id),
                },
            },
            data: {
                read: true,
            },
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deletedNotification = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = (req as any).user;

        if (!id) {
            res.status(404).json('Id is required');
            return;
        }

        const notification = await prisma.notification.deleteMany({
            where: { fromUserId: id },
        });

        res.status(200).json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};
