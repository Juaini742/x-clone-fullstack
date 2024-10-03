import express from 'express';
import {
    commentPost,
    createPost,
    deletePost,
    getAllPosts,
    getFollowingPost,
    getLikedPosts,
    getUserPosts,
    likeUnlikePost,
} from '../controllers/posts-controller';

const router = express.Router();

router.get('/all', getAllPosts);
router.get('/user/:email', getUserPosts);
router.get('/following', getFollowingPost);
router.get('/likes/:id', getLikedPosts);
router.post('/create', createPost);
router.post('/comment/:id', commentPost);
router.post('/like/:id', likeUnlikePost);
router.delete('/delete/:id', deletePost);

export default router;
