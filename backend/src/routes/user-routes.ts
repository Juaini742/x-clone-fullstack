import express from 'express';
import {
    followUnFollowUser,
    getMe,
    getSuggestionUsers,
    getUserProfile,
    updateUser,
} from '../controllers/user-controller';

const router = express.Router();

router.get('/me', getMe);
router.get('/suggested', getSuggestionUsers);
router.get('/profile/:email', getUserProfile);
router.post('/follow/:id', followUnFollowUser);
router.put('/update', updateUser);

export default router;
