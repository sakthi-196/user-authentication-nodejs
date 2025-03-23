import Joi from "joi";
export const signupSchema=Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds:{allow:['com','net']}
    }),
    password: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)),
});
export const signinSchema=Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds:{allow:['com','net']}
    }),
    password: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/
)),
})
export const acceptCodeSchema=Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds:{allow:['com','net']}
    }),
    providedCode: Joi.number().required(),
})
export const changePasswordSchema=Joi.object({
    newPassword: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)),
    oldPassword: Joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)),
}) 
export const acceptFPCodeSchema=Joi.object({
    email: Joi.string().min(6).max(60).required().email({
        tlds:{allow:['com','net']},
    }),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/)),
})
export const createPostSchema=Joi.object({
    title:Joi.string().min(3).max(50).required(),
    description:Joi.string().min(10).max(500).required(),
    userId:Joi.string().required(),
})