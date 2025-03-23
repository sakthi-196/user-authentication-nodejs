import express,{Router} from 'express';
import { identifier} from '../middlewares/identification.js';
import { createPost, getPosts,singlePost, updatePost,deletePost} from '../controllers/postsController.js';
const router=Router();

router.get('/all-posts',getPosts)
router.get('/single-post',singlePost);
router.post('/create-post',identifier,createPost);
router.put('/update-post',identifier,updatePost);
router.delete('/delete-post',identifier,deletePost) ;

export default router;