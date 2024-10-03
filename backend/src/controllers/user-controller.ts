import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: (req as any).user?.id },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                profileImg: true,
                coverImg: true,
                bio: true,
                link: true,
                createdAt: true,
                updatedAt: true,
                postId: true,
                following_userToFollowing: true,
            },
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json('Internal Server error');
    }
};

export const getSuggestionUsers = async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).user;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                following_userToFollowing: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(400).json('User not found');
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: id,
                },
            },
            include: {
                following_followingTouser: true,
                follower_userToFollower: true,
            },
        });

        const followedUserIds = user.following_userToFollowing.map(
            (following) => following.id
        );
        const filteredUsers = users.filter(
            (otherUser) => !followedUserIds.includes(otherUser.id)
        );
        const suggestedUsers = filteredUsers
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error(error);
        res.status(400).json('Internal Server error');
    }
};

export const getUserProfile = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.params;

        if (!email) {
            res.status(400).json('Email is required');
            return;
        }

        const user = await prisma.user.findFirst({
            where: { email },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                profileImg: true,
                coverImg: true,
                bio: true,
                link: true,
                createdAt: true,
                updatedAt: true,
                postId: true,

                post: true,
                likedpost: true,
                comment: true,
                follower_followerTouser: true,
                follower_userToFollower: true,
                following_followingTouser: true,
                following_userToFollowing: true,
            },
        });
        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json('Internal Server error');
    }
};

export const updateUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            fullName,
            email,
            username,
            currentPassword,
            newPassword,
            bio,
            link,
        } = req.body;
        let { profileImg, coverImg } = req.body;

        const { id } = (req as any).user;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        if (currentPassword & newPassword) {
            const matchPassword = await bcryptjs.compare(
                currentPassword,
                user.password
            );
            if (!matchPassword) {
                res.status(400).json({ error: 'Invalid credentials' });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json(
                    'Password must be at least 6 characters long'
                );
                return;
            }

            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(newPassword, salt);

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password: hashPassword,
                },
            });
        }

        if (coverImg) {
            if (user.coverImg) {
                const publicId = user.coverImg.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            const uploadedImage = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedImage.secure_url;

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    coverImg,
                },
            });
        }

        if (profileImg) {
            if (user.profileImg) {
                const publicId = user.profileImg
                    .split('/')
                    .pop()
                    ?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            const uploadedImage = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedImage.secure_url;

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    profileImg,
                },
            });
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                fullName,
                email,
                username,
                bio,
                link,
            },
        });

        res.status(200).json('User updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const followUnFollowUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: userId } = (req as any).user;
        const { id: targetUserId } = req.params;
        if (!targetUserId) {
            res.status(400).json('Id is missing');
            return;
        }
        if (userId === targetUserId) {
            res.status(400).json("You can't follow/unfollow yourself");
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { following_userToFollowing: true },
        });
        const otherUser = await prisma.user.findUnique({
            where: { id: targetUserId },
        });

        if (!otherUser && !user) {
            res.status(404).json('User not found');
            return;
        }

        const isFollowing = await prisma.following.findFirst({
            where: { userId, followingId: targetUserId },
        });

        if (!isFollowing) {
            await prisma.following.create({
                data: {
                    userId,
                    followingId: targetUserId,
                },
            });

            await prisma.follower.create({
                data: {
                    userId: targetUserId,
                    followerId: userId,
                },
            });

            await prisma.notification.create({
                data: {
                    type: 'follow',
                    fromUserId: userId,
                    toUserId: targetUserId,
                },
            });

            res.status(200).json({ message: 'User followed successfully' });
        } else {
            await prisma.following.deleteMany({
                where: { userId, followingId: targetUserId },
            });

            await prisma.follower.deleteMany({
                where: { userId: targetUserId, followerId: userId },
            });

            res.status(200).json({ message: 'User unfollowed successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};
