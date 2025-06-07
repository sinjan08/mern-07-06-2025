const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema, verifyOtpSchema } = require('../rules/authRules');
const { respond, HTTP_STATUS_CODES } = require('../utils/responseHelper');
const User = require('../models/userModel');
const { generateOTP } = require('../utils/helper');
const { sendMail } = require('../services/mailer');

class AuthController {
    /**
     * Signup method to register a new user
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async signup(req, res) {
        try {
            // validating request body against the signup schema
            const { error } = signupSchema.validate(req.body);
            if (error) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, error.details[0].message);
            }
            // getting payload and destructuring it
            const { name, email, password } = req.body;
            // checking user is exist or not
            const user = await User.findOne({ email });
            if (user) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'User already exists');
            }
            // hashing password
            const hashedPassword = await bcrypt.hash(password, 10);
            // creating new user
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                profileImage: req.file ? req.file.path : null, // save profile image path if uploaded
            });
            // saving user to the database
            await newUser.save();
            // generating otp
            const otp = generateOTP();
            // sending mail to the user
            const result = await sendMail({
                to: email,
                from: process.env.MAIL_FROM,// sender address
                subject: 'OTP for Account Verification',
                html: `<h3>Welcome to MERN Authenticator. Please use below given OTP to verify your account.</h3><p>Your OTP is: <strong>${otp}</strong></p>`
            });
            // checking if email sending was successful
            if (!result.success) {
                return respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to send OTP email');
            }
            // updating user with otp and otpExpires
            newUser.otp = otp;
            newUser.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
            await newUser.save();
            // attaching token to the response
            return respond(res, true, HTTP_STATUS_CODES.CREATED, 'User registered successfully. Please check your email for OTP');
        } catch (error) {
            respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    /**
     * verifyOTP method to verify the OTP sent to the user
     * @param {*} req 
     * @param {*} res 
     */
    async verifyOTP(req, res) {
        try {
            // validating request body against the verifyOtp schema
            const { error } = verifyOtpSchema.validate(req.body);
            if (error) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, error.details[0].message);
            }
            // getting payload and destructuring it
            const { email, otp } = req.body;

            // checking user is exist or not
            const user = await User.findOne({ email });
            if (!user) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'User not found');
            }
            // checking if otp is valid and not expired
            if (user.otp !== otp || Date.now() > user.otpExpires) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'Invalid or expired OTP');
            }
            // updating user as verified
            user.isVerified = true;
            user.otp = null; // clearing OTP after verification
            user.otpExpires = null; // clearing OTP expiration time
            await user.save();
            // attaching token to the response
            return respond(res, true, HTTP_STATUS_CODES.OK, 'OTP verified successfully');
        }
        catch (error) {
            respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
        }
    }


    /**
     * Login method to authenticate a user
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async login(req, res) {
        try {
            // validating request body against the login schema
            const { error } = loginSchema.validate(req.body);
            if (error) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, error.details[0].message);
            }
            // getting payload and destructuring it
            const { email, password } = req.body;

            // checking user is exist or not
            const user = await User.findOne({ email });
            if (!user) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'Invalid email');
            }
            // comparing password with hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, 'Invalid password');
            }
            // checking if user is verified
            if (!user.isVerified) {
                return respond(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, 'User is not verified. Please verify your account first.');
            }
            // generating JWT token
            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '12h'
            });
            // attaching token to the response
            return respond(res, true, HTTP_STATUS_CODES.OK, 'Login successful', { token, user });
        } catch (error) {
            respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}

module.exports = new AuthController();