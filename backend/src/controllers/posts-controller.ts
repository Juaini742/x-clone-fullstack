import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

export const getAllPosts = async (_req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        profileImg: true,
                        coverImg: true,
                        bio: true,
                        createdAt: true,
                        updatedAt: true,
                        postId: true,
                        likedpost: true,
                    },
                },
                comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                profileImg: true,
                            },
                        },
                    },
                },
                likedpost: true,
            },
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const createPost = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.array() });
            return;
        }

        const { id } = (req as any).user;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        const { text } = req.body;
        let { img } = req.body;

        if (!text && !img) {
            res.status(400).json({ error: 'Post must have text or image' });
            return;
        }

        if (img) {
            const uploadToCloud = await cloudinary.uploader.upload(img);
            img = uploadToCloud.secure_url;
        }

        const post = await prisma.post.create({
            data: {
                userId: user.id,
                text,
                img,
            },
        });

        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const deletePost = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
        });
        if (!post) {
            res.status(400).json('Post not found');
            return;
        }

        if (post.userId !== (req as any).user.id) {
            res.status(401).json('Unauthorized: Cannot delete this post');
            return;
        }

        const deletePost = await prisma.post.delete({
            where: { id: post.id },
        });

        res.status(200).json({ msg: 'Success delete post', post: deletePost });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const commentPost = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { text } = req.body;
        const { id } = (req as any).user;
        const { id: postId } = req.params;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            res.status(400).json('Post not found');
            return;
        }

        await prisma.comment.create({
            data: {
                text,
                userId: id,
                postId: post.id,
            },
        });

        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const likeUnlikePost = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const postId = req.params.id;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { likedpost: true },
        });
        if (!post) {
            res.status(400).json('Post not found');
            return;
        }

        const userLikedPost = post.likedpost.some(
            (like) => like.userId === userId
        );

        if (!userLikedPost) {
            await prisma.likedpost.create({
                data: {
                    postId: post.id,
                    userId,
                },
            });

            await prisma.notification.create({
                data: {
                    fromUserId: userId,
                    toUserId: post.userId,
                    type: 'like',
                },
            });

            const updatedLikes = await prisma.likedpost.findMany({
                where: { postId: post.id },
            });
            res.status(200).json({ data: updatedLikes });
        } else {
            await prisma.likedpost.deleteMany({
                where: {
                    postId: post.id,
                    userId: userId,
                },
            });

            const updatedLikes = await prisma.likedpost.findMany({
                where: { postId: post.id },
            });
            res.status(200).json({ data: updatedLikes });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        if (!email) {
            res.status(400).json('Email is required');
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        const posts = await prisma.post.findMany({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        profileImg: true,
                        coverImg: true,
                        bio: true,
                        createdAt: true,
                        updatedAt: true,
                        postId: true,
                    },
                },
                likedpost: true,
                comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                profileImg: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const getFollowingPost = async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).user;

        const following = await prisma.following.findMany({
            where: { userId: id },
            select: { followingId: true },
        });

        const followingIds = following.map((f) => f.followingId);

        const post = await prisma.post.findMany({
            where: {
                userId: { in: followingIds },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        profileImg: true,
                        coverImg: true,
                        bio: true,
                        createdAt: true,
                        updatedAt: true,
                        likedpost: true,
                        following_userToFollowing: true,
                    },
                },
                comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                profileImg: true,
                            },
                        },
                    },
                },
                likedpost: true,
            },
        });

        if (post.length === 0) {
            res.status(404).json('No post found');
            return;
        }

        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

export const getLikedPosts = async (req: Request, res: Response) => {
    try {
        const { id: userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json('User not found');
            return;
        }

        const posts = await prisma.likedpost.findMany({
            where: {
                userId,
            },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                email: true,
                                profileImg: true,
                                coverImg: true,
                                bio: true,
                                createdAt: true,
                                updatedAt: true,
                                likedpost: true,
                                following_userToFollowing: true,
                            },
                        },
                        comment: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        profileImg: true,
                                    },
                                },
                            },
                        },
                        likedpost: true,
                    },
                },
            },
        });

        const data = posts.map((item) => item.post);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};
