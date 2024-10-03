import express from 'express';
import authRouter from './auth-routes';
import userRouter from './user-routes';
import postsRouter from './posts-routes';
import notificationRouter from './notification-routes';
import { protectedRoutes } from '../middleware/protectedRoute';
import { logout } from '../controllers/auth-controller';
const router = express.Router();

// public routes
router.use('/auth', authRouter);

// secured routes
router.use([protectedRoutes as express.RequestHandler]);
router.post('/secured/logout', logout);
router.use('/secured/user', userRouter);
router.use('/secured/posts', postsRouter);
router.use('/secured/notifications', notificationRouter);

export default router;
