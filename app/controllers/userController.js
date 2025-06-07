const User = require("../models/userModel");
const { HTTP_STATUS_CODES, respond } = require("../utils/responseHelper");
const fs = require('fs');
const path = require('path');

class UserController {
    /**
     * Method to get user details
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getUser(req, res) {
        try {
            // Assuming req.user is set by a middleware after authentication
            const user_id = req?.user?.id;

            if (!user_id) {
                return respond(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, "User not authenticated");
            }
            // fetching user details from the database
            const user = await User.findById(user_id);
            if (!user) {
                return respond(res, false, HTTP_STATUS_CODES.NOT_FOUND, "User not found");
            }
            // removing sensitive information before sending response
            const { password, otp, otpExpires, ...userData } = user.toObject();
            return respond(res, true, HTTP_STATUS_CODES.OK, "User details fetched successfully", userData);
        } catch (error) {
            return respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    /**
     * Method to update user's profile image
     * @param {*} req
     * @param {*} res
     * @returns
     * */
    async updateProfileImage(req, res) {
        try {
            const user_id = req?.user?.id;

            if (!user_id) {
                return respond(res, false, HTTP_STATUS_CODES.UNAUTHORIZED, "User not authenticated");
            }

            if (!req.file) {
                return respond(res, false, HTTP_STATUS_CODES.BAD_REQUEST, "No file uploaded");
            }

            // Get current user data
            const user = await User.findById(user_id);
            if (!user) {
                return respond(res, false, HTTP_STATUS_CODES.NOT_FOUND, "User not found");
            }

            // Delete old profile image if it exists
            if (user.profileImage) {
                const oldImagePath = path.resolve(user.profileImage);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.warn('Failed to delete old image:', err.message);
                    }
                });
            }

            // Update user with new image
            user.profileImage = req.file.path;
            await user.save();

            return respond(res, true, HTTP_STATUS_CODES.OK, "Profile image updated successfully", {
                profileImage: user.profileImage
            });

        } catch (error) {
            return respond(res, false, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message);
        }
    }

}

module.exports = new UserController();