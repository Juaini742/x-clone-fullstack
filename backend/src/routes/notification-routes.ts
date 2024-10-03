import express from 'express';
import {
    deletedNotification,
    getNotification,
} from '../controllers/notification-controller';

const router = express.Router();

router.get('/', getNotification);
router.delete('/', deletedNotification);

export default router;
