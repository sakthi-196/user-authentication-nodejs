import { createPostSchema } from '../middlewares/validators.js';
import Post from '../models/postsModel.js';
export const getPosts=async(req,res)=>{
    const {page}=req.query;
    const postsPerPage=10;
    try{
        let pageNum=0;
        if(page <= 1){
            pageNum = 0;
        }else{
            pageNum=page - 1;
        }
        const result = await Post.find()
        .sort({createdAt: -1})
        .skip(pageNum * postsPerPage)
        .limit(postsPerPage)
        .populate({
            path: 'userId',
            select:'email',
        });
        res.status(200).json({success:true,message:'posts',data:result})
    }catch(err){
        console.log(err)
    }
}
export const singlePost=async(req,res)=>{
    const { _id } = req.query;

	try {
		const existingPost = await Post.findOne({ _id }).populate({
			path: 'userId',
			select: 'email',
		});
		if (!existingPost) {
			return res
				.status(404)
				.json({ success: false, message: 'Post unavailable' });
		}
		res
			.status(200)
			.json({ success: true, message: 'single post', data: existingPost });
	} catch (error) {
		console.log(error);
	}
}
export const createPost=async(req,res)=>{
    const {title,description}=req.body;
    const {userId}=req.user;
    try{
        const {error,value}=createPostSchema.validate({title,description,userId});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const result=await Post.create({title,description,userId})
        res.status(201).json({success:true,message:'post created',data:result})
    }catch(err){
        console.log(err)
    }
}
export const updatePost=async(req,res)=>{
    const {_id}=req.query;
    const {title,description}=req.body;
    const {userId}=req.user;
    try{
        const {error,value}=createPostSchema.validate({title,description,userId});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existingPost=await Post.findOne({_id});
        if(!existingPost){
            return res.status(404).json({success:false,message:"Post unavailable"})
        }
        if(existingPost.userId.toString() !== userId){
            return res.status(403).json({success:false,message:"unauthorized"})
        }
        existingPost.title=title;
        existingPost.description=description;
        const result=await existingPost.save();
        res.status(201).json({success:true,message:'post updated',data:result})
    }catch(err){
        console.log(err)
    }
}
export const deletePost=async(req,res)=>{
    const {_id}=req.query;
    const {userId}=req.user;
    try{
        const existingPost = await Post.findOne({_id});
        if(!existingPost){
            return res.status(404).json({success:false,message:'Post not found/already deleted'})
        }
        if(existingPost.userId.toString() !== userId){
            return res.status(403).json({success:false,message:'unauthorized'})
        }
        await Post.deleteOne({_id});
        res.status(200).json({success:true,message:"Post deleted"})
    }catch(err){
        console.log(err)
    }
}
