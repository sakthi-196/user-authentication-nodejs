import { signupSchema,signinSchema, acceptCodeSchema, changePasswordSchema,acceptFPCodeSchema} from "../middlewares/validators.js";
import { doHash,doHashValidation, hmacProcess} from "../utils/hashing.js";
import User from '../models/usersModel.js';
import jwt from 'jsonwebtoken';
import transport from '../middlewares/sendMail.js';
//signup
export const signup=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const  {error,value}=signupSchema.validate({email,password});
        if(error){
            // console.log(error)
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(401).json({success:false,message:'User already exists!'})
        }
        const hashedPassword=await doHash(password,12);
        const newUser=new User({
            email,
            password:hashedPassword,
        });
        const result=await newUser.save();
        result.password=undefined;
        res.status(201).json({
            success:true,
            message: 'Your Account has been Created Successfully',
            result,
        })
    }catch(err){
        console.error(err)
    }
};
//signin
export const signin=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const {error,value}=signinSchema.validate({email,password});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        } 
        const existingUser=await User.findOne({email}).select('+password')
        if(!existingUser){
            return res.status(401).json({success:false,message:"User doesn't exists!"})  
        }
        const result=await doHashValidation(password,existingUser.password)
        if(!result){
            return res
            .status(401)
            .json({success:false,message:'Invalid credentials!'});
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email:existingUser.email,
            verified:existingUser.verified,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '8h',
        }
    );
    res
        .cookie('Authorization','Bearer '+ token,{
            expires: new Date(Date.now ()+ 8 * 3600000),
            httpOnly: true,
            secure:true,
        })
        .json({
            success: true,
            token,
            message: 'Logged in successfully'
        });   
    }catch(err){
        console.log(err)
    }
};
//signout
export const signout=async(req,res)=>{
    res
        .clearCookie('Authorization')
        .status(200)
        .json({
            success:true,
            messgae:"Logged out successfully"
        })
}
//send verification code via mail
export const sendVerificationCode=async(req,res)=>{
    const {email}=req.body;
    try{
        const existingUser=await User.findOne({email})
        if(!existingUser){
            return res
                .status(401)
                .json({
                    success:false,
                    message:"User doesn't exists!"
                })  
        }
        if(existingUser.verified){
            return res
            .status(400)
            .json({
                success:false,
                message:"You're already verified!"
            }) 
        }
        const codeValue=Math.floor(Math.random()*1000000).toString();
        let info=await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'verification code',
            html:"<h1>"+codeValue+"</h1>",
        })
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue=hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode=hashedCodeValue;
            existingUser.verificationCodeValidation=Date.now();
            await existingUser.save()
            return res.status(200).json({success: true,message:'code sent'})
        }
        res.status(400).json({success: false,message:'code sent failed'})
    }catch(err){
        console.log(err)
    }
}
//validate verification code/user
export const verifyVerificationCode=async(req,res)=>{
    const {email,providedCode}=req.body;
    try{
        const {error,value}=acceptCodeSchema.validate({email,providedCode});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        } 
        const codeValue=providedCode.toString();
        const existingUser=await User.findOne({email}).select('+verificationCode + verificationCodeValidation');
        if(!existingUser){
            return res.status(401).json({success:false,message:"User doesn't exist"});
        }
        if(existingUser.verified){
            return res.status(400).json({success:false,message:"You're already verified"})
        }
        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
            return res.status(400).json({success:false,message:"Something is wrong with the code"})
        }
        console.log(existingUser.verificationCodeValidation);
        if(Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000){
            return res.status(400).json({success:false,message:"Your code has been expired"});
        }
        const hashedCodeValue= hmacProcess(
            codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET
        );
        if(hashedCodeValue === existingUser.verificationCode){
            existingUser.verified=true;
            existingUser.verificationCode= undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({success:true,message:"Your account has been verified"})
        }
        return res.status(400).json({success:true,messgae:"unexpected occured!"})
    }catch(err){
        console.log(err)
    }
}
//changing password functionality
export const changePassword=async(req,res)=>{
    const {userId,verified}=req.user;
    const {oldPassword,newPassword}=req.body;
    try{
        const {error,value}=changePasswordSchema.validate({newPassword,oldPassword});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }  
        //only verified user can change password  
        if(!verified){ //if you don't need this feature,remove this part 
            return res.status(401).json({success:false,message:"You're not verified user"})
        }
        const existingUser=await User.findOne({_id: userId}).select('+password');
        if(!existingUser){
            return res.status(401).json({success: false,message:"User does'nt exits"})
        }
        const result=await doHashValidation(oldPassword,existingUser.password)
        if(!result){
            return res.status(401).json({success:false,message:"Invalid credentials"});
        }
        const hashedPassword=await doHash(newPassword,12);
        existingUser.password=hashedPassword;
        await existingUser.save();
        return res.status(200).json({success:true,message:"Password updated"})
    }catch(err){
        console.log(err)
    }
}
//forgot password functionality
export const sendForgotPasswordCode=async(req,res)=>{
    const {email}=req.body;
    try{
        const existingUser=await User.findOne({email})
        if(!existingUser){
            return res
                .status(401)
                .json({
                    success:false,
                    message:"User doesn't exists!"
                })  
        }
        const codeValue=Math.floor(Math.random()*1000000).toString();
        let info=await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Forgot Password code',
            html:"<h1>"+codeValue+"</h1>",
        })
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue=hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.forgotPasswordCode=hashedCodeValue;
            existingUser.forgotPasswordCodeValidation=Date.now();
            await existingUser.save()
            return res.status(200).json({success: true,message:'code sent'})
        }
        res.status(400).json({success: false,message:'code sent failed'})
    }catch(err){
        console.log(err)
    }    
}
//validate verification code/user
export const verifyForgotPasswordCode=async(req,res)=>{
    const {email,providedCode,newPassword}=req.body;
    try{
        const {error,value}=acceptFPCodeSchema.validate({email,providedCode,newPassword});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        } 
        const codeValue=providedCode.toString();
        const existingUser=await User.findOne({email}).select('+forgotPasswordCode + forgotPasswordCodeValidation');
        if(!existingUser){
            return res.status(401).json({success:false,message:"User doesn't exist"});
        }
        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
            return res.status(400).json({success:false,message:"Something is wrong with the code"})
        }
        if(Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000){
            return res.status(400).json({success:false,message:"Your code has been expired"});
        }
        const hashedCodeValue= hmacProcess(
            codeValue,process.env.HMAC_VERIFICATION_CODE_SECRET
        );
        if(hashedCodeValue === existingUser.forgotPasswordCode){
            const hashedPassword = await doHash(newPassword,12);
            existingUser.password=hashedPassword;
            existingUser.forgotPasswordCode= undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({success:true,message:"Your password has been updated"})
        }
        return res.status(400).json({success:false,messgae:"unexpected occured!"})
    }catch(err){
        console.log(err)
    }
}
