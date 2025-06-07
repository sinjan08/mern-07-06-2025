const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),// name should be a string with min length 3 and max length 30
    email: Joi.string().email().required(), // email should be a valid email format
    password: Joi.string().min(6).max(20).required() // password should be a string with min length 6 and max length 20
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(), // email should be a valid email format
    otp: Joi.string().length(6).required() // otp should be a string with length 6
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(), // email should be a valid email format
    password: Joi.string().min(6).max(20).required() // password should be a string with min length 6 and max length 20
});

module.exports = {
    signupSchema,
    verifyOtpSchema,
    loginSchema
}